import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler";
import Booking, { PaymentStatus, BookingStatus } from "../models/Booking.model";
import Seat, { SeatStatus } from "../models/Seat.model";
import Showtime from "../models/Showtime.model";

// @desc    Create a new booking (pending payment)
// @route   POST /api/bookings
// @access  Protected
export const createBooking = asyncHandler(async (req: Request, res: Response) => {
    const { showtimeId, selectedSeats } = req.body;
    const userId = req.user?.userId;

    if (!showtimeId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
        res.status(400).json({ success: false, message: "Missing showtimeId or selectedSeats" });
        return;
    }

    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
        res.status(404).json({ success: false, message: "Showtime not found" });
        return;
    }

    const numberOfTickets = selectedSeats.length;
    const baseFare = showtime.ticketPrice * numberOfTickets;
    const platformFee = 50;
    const taxes = Math.round(baseFare * 0.18 * 100) / 100; // 18% GST, rounded
    const totalAmount = baseFare + platformFee + taxes;

    const booking = await Booking.create({
        userId,
        showtimeId,
        movieId: showtime.movieId,
        screenId: showtime.screenId,
        theatreId: showtime.theatreId,
        selectedSeats,
        numberOfTickets,
        totalAmount,
        baseFare,
        platformFee,
        taxes,
        paymentStatus: PaymentStatus.PENDING,
        bookingStatus: BookingStatus.CONFIRMED, // will be overwritten on cancel; seats aren't touched yet
        showDate: showtime.showDate,
        showTime: showtime.showTime,
    });

    res.status(201).json({
        success: true,
        message: "Booking created — proceed to payment",
        data: booking,
    });
});

// @desc    Cancel a booking (user can only cancel their own)
// @route   PUT /api/bookings/:id/cancel
// @access  Protected
export const cancelBooking = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const userId = req.user?.userId as string;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid booking ID" });
        return;
    }

    const booking = await Booking.findById(id);

    if (!booking) {
        res.status(404).json({ success: false, message: "Booking not found" });
        return;
    }

    // Ownership check — a user must only cancel their own booking
    if (booking.userId.toString() !== userId) {
        res.status(403).json({ success: false, message: "You can only cancel your own bookings" });
        return;
    }

    if (booking.bookingStatus === BookingStatus.CANCELLED) {
        res.status(400).json({ success: false, message: "Booking is already cancelled" });
        return;
    }

    // 1. Mark booking as cancelled
    await Booking.findByIdAndUpdate(id, {
        bookingStatus: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
    });

    // 2. Release seats back to available in Mongo
    await Seat.updateMany(
        {
            showtimeId: booking.showtimeId,
            seatNumber: { $in: booking.selectedSeats },
        },
        { $set: { status: SeatStatus.AVAILABLE } }
    );

    // 3. Increment available seats on the showtime
    await Showtime.findByIdAndUpdate(booking.showtimeId, {
        $inc: { availableSeats: booking.selectedSeats.length },
    });

    res.status(200).json({
        success: true,
        message: "Booking cancelled successfully",
    });
});

// @desc Get user's own bookings
export const getUserBookings = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const bookings = await Booking.find({ userId })
    .populate('showtimeId')
    .populate('movieId')
    .populate('theatreId')
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: bookings });
});

// @desc Get a single booking by ID (only owner)
export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user?.userId as string;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid booking ID' });
  }
  const booking = await Booking.findById(id).populate('showtimeId');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }
  if (booking.userId.toString() !== userId) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  res.status(200).json({ success: true, data: booking });
});
