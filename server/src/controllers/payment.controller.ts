import { Request, Response } from "express";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler } from "../middleware/asyncHandler";
import Payment, { PaymentTxnStatus } from "../models/Payment.model";
import Booking, { PaymentStatus, BookingStatus } from "../models/Booking.model";
import Seat, { SeatStatus } from "../models/Seat.model";
import Showtime from "../models/Showtime.model";
import redisClient from "../config/redis";

// Lua script: only releases locks owned by this user (from §6)
const RELEASE_SCRIPT = `
local released = {}
for i = 1, #KEYS do
  if redis.call("GET", KEYS[i]) == ARGV[1] then
    redis.call("DEL", KEYS[i])
    table.insert(released, KEYS[i])
  end
end
return released
`;

// @desc    Initiate a mock payment session
// @route   POST /api/payments/initiate
// @access  Protected
export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
    const { bookingId, method } = req.body;
    const userId = req.user?.userId;

    if (!bookingId || !method) {
        res.status(400).json({ success: false, message: "Missing bookingId or payment method" });
        return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
    }

    if (booking.userId.toString() !== userId) {
        res.status(403).json({ success: false, message: "Unauthorized" });
        return;
    }

    if (booking.paymentStatus !== PaymentStatus.PENDING) {
        res.status(400).json({ success: false, message: "Payment already processed for this booking" });
        return;
    }

    // Generate a mock transaction ID
    const transactionId = `TXN_${uuidv4()}`;

    const payment = await Payment.create({
        bookingId,
        userId,
        amount: booking.totalAmount,
        method,
        transactionId,
        status: PaymentTxnStatus.PENDING,
    });

    // Update the booking with the transactionId for traceability
    await Booking.findByIdAndUpdate(bookingId, { transactionId });

    res.status(201).json({
        success: true,
        message: "Payment session initiated",
        data: {
            paymentId: payment._id,
            transactionId,
            amount: payment.amount,
            currency: payment.currency,
        },
    });
});

// @desc    Verify mock payment outcome — THE CRITICAL STEP
// @route   POST /api/payments/verify
// @access  Protected
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const { bookingId, paymentSuccess } = req.body; // paymentSuccess: boolean from mock gateway
    const userId = req.user?.userId;

    if (!bookingId || paymentSuccess === undefined) {
        res.status(400).json({ success: false, message: "Missing bookingId or paymentSuccess" });
        return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
    }

    if (booking.userId.toString() !== userId) {
        res.status(403).json({ success: false, message: "Unauthorized" });
        return;
    }

    if (booking.paymentStatus !== PaymentStatus.PENDING) {
        res.status(400).json({ success: false, message: "Payment already processed for this booking" });
        return;
    }

    const { showtimeId, selectedSeats } = booking;

    // ──────────────────────────────────────────────────
    // PAYMENT FAILURE PATH
    // ──────────────────────────────────────────────────
    if (!paymentSuccess) {
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: PaymentStatus.FAILED });
        await Payment.findOneAndUpdate(
            { bookingId },
            { status: PaymentTxnStatus.FAILED, failureReason: "Payment declined by gateway" }
        );

        // Release Redis locks immediately — seat goes back to selectable
        const lockKeys = selectedSeats.map((s) => `lock:seat:${showtimeId}:${s}`);
        try {
            await redisClient.eval(RELEASE_SCRIPT, lockKeys.length, ...lockKeys, userId);
        } catch (err) {
            console.error("Redis release error on payment failure:", err);
        }

        res.status(200).json({ success: true, message: "Payment failed. Seats released." });
        return;
    }

    // ──────────────────────────────────────────────────
    // PAYMENT SUCCESS PATH — transactional
    // ──────────────────────────────────────────────────

    // Step 1: Re-verify Redis lock still belongs to this user
    const lockKeys = selectedSeats.map((s) => `lock:seat:${showtimeId}:${s}`);
    let locksValid = true;

    try {
        const lockValues = await redisClient.mget(lockKeys);
        for (const val of lockValues) {
            if (val !== userId) {
                locksValid = false;
                break;
            }
        }
    } catch (err) {
        console.error("Redis verification error:", err);
        res.status(503).json({ success: false, message: "Service Unavailable — could not verify seat locks" });
        return;
    }

    if (!locksValid) {
        // TTL expired or another user grabbed the seat
        await Booking.findByIdAndUpdate(bookingId, { paymentStatus: PaymentStatus.FAILED });
        await Payment.findOneAndUpdate(
            { bookingId },
            { status: PaymentTxnStatus.FAILED, failureReason: "Seat hold expired during checkout" }
        );
        res.status(409).json({
            success: false,
            message: "Your seat hold expired — please reselect seats and try again",
        });
        return;
    }

    // Step 2: Mongo transaction — seat commitment + booking confirmation
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Conditional update — only flips seats that are still 'available'.
        // Mongo-side defense in depth, in case Redis and Mongo ever disagree.
        const updateResult = await Seat.updateMany(
            {
                showtimeId,
                seatNumber: { $in: selectedSeats },
                status: SeatStatus.AVAILABLE,
            },
            { $set: { status: SeatStatus.OCCUPIED } },
            { session }
        );

        if (updateResult.modifiedCount !== selectedSeats.length) {
            throw new Error("Seat conflict detected during confirmation");
        }

        await Booking.findByIdAndUpdate(
            bookingId,
            { paymentStatus: PaymentStatus.SUCCESS, bookingStatus: BookingStatus.CONFIRMED },
            { session }
        );

        await Showtime.findByIdAndUpdate(
            showtimeId,
            { $inc: { availableSeats: -selectedSeats.length } },
            { session }
        );

        await Payment.findOneAndUpdate(
            { bookingId },
            { status: PaymentTxnStatus.SUCCESS },
            { session }
        );

        await session.commitTransaction();
    } catch (err) {
        await session.abortTransaction();
        res.status(409).json({ success: false, message: "Seat conflict — please reselect seats" });
        return;
    } finally {
        session.endSession();
    }

    // Step 3: Only AFTER transaction commits, release Redis locks
    try {
        await redisClient.eval(RELEASE_SCRIPT, lockKeys.length, ...lockKeys, userId);
    } catch (err) {
        // Non-fatal: locks will expire naturally via TTL, but log it
        console.error("Redis release error after successful payment:", err);
    }

    res.status(200).json({
        success: true,
        message: "Payment verified and booking confirmed",
        data: {
            bookingId: booking._id,
            selectedSeats,
            totalAmount: booking.totalAmount,
        },
    });
});

// @desc    Get payment status for a booking
// @route   GET /api/payments/:bookingId
// @access  Protected
export const getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const userId = req.user?.userId;

  if (!bookingId) {
    return res.status(400).json({ success: false, message: "Missing bookingId" });
  }

  const payment = await Payment.findOne({ bookingId }).populate('bookingId');
  if (!payment) {
    return res.status(404).json({ success: false, message: "Payment not found" });
  }

  // Ensure the requester owns the booking
  if ((payment as any).bookingId.userId.toString() !== userId) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  res.status(200).json({ success: true, data: payment });
});
