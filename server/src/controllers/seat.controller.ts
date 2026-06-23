import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler";
import Seat from "../models/Seat.model";
import redisClient from "../config/redis";

// @desc    Get seats for a showtime, merging transient Redis locks
// @route   GET /api/showtimes/:showtimeId/seats
// @access  Public
export const getShowtimeSeats = asyncHandler(async (req: Request, res: Response) => {
    const { showtimeId } = req.params as { showtimeId: string };

    if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
        res.status(400).json({ success: false, message: "Invalid showtime ID" });
        return;
    }

    // 1. Fetch seats from MongoDB, naturally sorted by grid layout
    const seats = await Seat.find({ showtimeId }).sort({ rowLabel: 1, columnNumber: 1 });

    if (!seats || seats.length === 0) {
        res.status(404).json({ success: false, message: "No seats found for this showtime" });
        return;
    }

    // 2. Prep Redis keys (lock:seat:showtimeId:seatNumber)
    const lockKeys = seats.map((s) => `lock:seat:${showtimeId}:${s.seatNumber}`);

    // 3. Batch fetch all lock states in a single MGET
    const lockValues = lockKeys.length ? await redisClient.mget(lockKeys) : [];

    // 4. Merge transient locks with hard MongoDB commits
    const seatsWithLiveStatus = seats.map((seat, i) => ({
        ...seat.toObject(),
        effectiveStatus: seat.status === "occupied"
            ? "occupied"
            : lockValues[i]
                ? "locked"
                : "available",
    }));

    // 5. Group by rowLabel for easy frontend rendering (optional but highly recommended)
    const groupedSeats = seatsWithLiveStatus.reduce((acc: any, seat) => {
        if (!acc[seat.rowLabel]) {
            acc[seat.rowLabel] = [];
        }
        acc[seat.rowLabel].push(seat);
        return acc;
    }, {});

    res.status(200).json({
        success: true,
        data: groupedSeats,
    });
});

const ACQUIRE_SCRIPT = `
for i = 1, #KEYS do
  local owner = redis.call("GET", KEYS[i])
  if owner and owner ~= ARGV[1] then
    return 0
  end
end
for i = 1, #KEYS do
  redis.call("SET", KEYS[i], ARGV[1], "EX", ARGV[2])
end
return 1
`;

// @desc    Lock seats temporarily during checkout
// @route   POST /api/seats/lock
// @access  Protected
export const lockSeats = asyncHandler(async (req: Request, res: Response) => {
    const { showtimeId, seatNumbers } = req.body;
    const userId = req.user?.userId as string;

    if (!showtimeId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        res.status(400).json({ success: false, message: "Missing showtimeId or seatNumbers array" });
        return;
    }

    const keys = seatNumbers.map((n) => `lock:seat:${showtimeId}:${n}`);
    const ttlSeconds = "300"; // 5 minutes

    try {
        const result = await redisClient.eval(
            ACQUIRE_SCRIPT,
            keys.length,
            ...keys,
            userId,
            ttlSeconds
        );

        if (result === 0) {
            res.status(409).json({ success: false, message: "One or more seats are no longer available" });
            return;
        }

        res.status(200).json({
            success: true,
            lockedSeats: seatNumbers,
            expiresAt: Date.now() + (parseInt(ttlSeconds) * 1000)
        });
    } catch (error) {
        console.error("Redis lock error:", error);
        res.status(503).json({ success: false, message: "Service Unavailable. Could not acquire seat locks." });
    }
});

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

// @desc    Release seat locks explicitly
// @route   POST /api/seats/unlock
// @access  Protected
export const unlockSeats = asyncHandler(async (req: Request, res: Response) => {
    const { showtimeId, seatNumbers } = req.body;
    const userId = req.user?.userId as string;

    if (!showtimeId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        res.status(400).json({ success: false, message: "Missing showtimeId or seatNumbers array" });
        return;
    }

    const keys = seatNumbers.map((n) => `lock:seat:${showtimeId}:${n}`);

    try {
        const released = await redisClient.eval(
            RELEASE_SCRIPT,
            keys.length,
            ...keys,
            userId
        );

        res.status(200).json({ success: true, releasedKeys: released });
    } catch (error) {
        console.error("Redis unlock error:", error);
        res.status(503).json({ success: false, message: "Service Unavailable. Could not release seat locks." });
    }
});

const EXTEND_SCRIPT = `
for i = 1, #KEYS do
  if redis.call("GET", KEYS[i]) == ARGV[1] then
    redis.call("EXPIRE", KEYS[i], ARGV[2])
  end
end
return 1
`;

// @desc    Extend seat lock TTL if checkout takes longer
// @route   POST /api/seats/extend-lock
// @access  Protected
export const extendLock = asyncHandler(async (req: Request, res: Response) => {
    const { showtimeId, seatNumbers } = req.body;
    const userId = req.user?.userId as string;

    if (!showtimeId || !seatNumbers || !Array.isArray(seatNumbers) || seatNumbers.length === 0) {
        res.status(400).json({ success: false, message: "Missing showtimeId or seatNumbers array" });
        return;
    }

    const keys = seatNumbers.map((n) => `lock:seat:${showtimeId}:${n}`);
    const ttlSeconds = "300"; // Another 5 minutes

    try {
        await redisClient.eval(
            EXTEND_SCRIPT,
            keys.length,
            ...keys,
            userId,
            ttlSeconds
        );

        res.status(200).json({
            success: true,
            message: "Lock extended successfully",
            expiresAt: Date.now() + (parseInt(ttlSeconds) * 1000)
        });
    } catch (error) {
        console.error("Redis extend error:", error);
        res.status(503).json({ success: false, message: "Service Unavailable. Could not extend seat locks." });
    }
});

