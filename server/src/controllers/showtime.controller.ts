import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler";
import Showtime, { ShowtimeStatus } from "../models/Showtime.model";
import Screen from "../models/Screen.model";
import Movie from "../models/Movie.model";
import Seat, { SeatStatus } from "../models/Seat.model";

// @desc    Get showtimes conditionally
// @route   GET /api/showtimes
// @access  Public
export const getShowtimes = asyncHandler(async (req: Request, res: Response) => {
    const { movieId, theatreId, date } = req.query;

    const filter: any = {};

    if (movieId) filter.movieId = movieId;
    if (theatreId) filter.theatreId = theatreId;

    if (date) {
        const start = new Date(date as string);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        filter.showDate = { $gte: start, $lt: end };
    }

    const showtimes = await Showtime.find(filter).populate("movieId theatreId screenId");

    res.status(200).json({
        success: true,
        data: showtimes,
    });
});

// @desc    Create a showtime and its seat layout
// @route   POST /api/showtimes
// @access  Admin
export const createShowtime = asyncHandler(async (req: Request, res: Response) => {
    const { screenId, movieId, theatreId, showDate, showTime, format, language, ticketPrice } = req.body;

    if (!screenId || !movieId || !theatreId || !showDate || !showTime || !ticketPrice) {
        res.status(400).json({ success: false, message: "Missing required fields" });
        return;
    }

    const screen = await Screen.findById(screenId);
    if (!screen) {
        res.status(404).json({ success: false, message: "Screen not found" });
        return;
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
        res.status(404).json({ success: false, message: "Movie not found" });
        return;
    }

    // Overlap check
    const showStart = new Date(`${showDate}T${showTime}`);
    const showEnd = new Date(showStart.getTime() + movie.duration * 60000);

    const sameDayShows = await Showtime.find({
        screenId,
        showDate: { 
            $gte: new Date(showDate).setHours(0, 0, 0, 0), 
            $lt: new Date(showDate).setHours(23, 59, 59, 999) 
        },
        status: { $ne: ShowtimeStatus.CANCELLED },
    }).populate("movieId");

    for (const show of sameDayShows) {
        const existingMovie = show.movieId as any;
        const existingStart = new Date(`${show.showDate.toISOString().split("T")[0]}T${show.showTime}`);
        const existingEnd = new Date(existingStart.getTime() + existingMovie.duration * 60000);

        // Check interval overlap
        if (showStart < existingEnd && showEnd > existingStart) {
            res.status(409).json({ success: false, message: "Showtime overlaps with an existing show" });
            return;
        }
    }

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const showtime = await Showtime.create(
            [{
                screenId, 
                movieId, 
                theatreId, 
                showDate, 
                showTime, 
                format, 
                language, 
                ticketPrice,
                totalSeats: screen.capacity,
                availableSeats: screen.capacity,
                status: ShowtimeStatus.UPCOMING,
            }],
            { session }
        );

        const seatDocs = screen.seatMatrix.seats.map((s) => ({
            showtimeId: showtime[0]._id,
            screenId,
            seatNumber: `${s.rowLabel}${s.seatNumber}`,
            rowLabel: s.rowLabel,
            columnNumber: s.seatNumber,
            status: SeatStatus.AVAILABLE,
        }));

        await Seat.insertMany(seatDocs, { session });

        await session.commitTransaction();
        res.status(201).json({ success: true, data: showtime[0] });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ success: false, message: "Failed to create showtime" });
    } finally {
        session.endSession();
    }
});
