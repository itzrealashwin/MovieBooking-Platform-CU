import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler";
import Movie from "../models/Movie.model";
import Showtime from "../models/Showtime.model";
import { ShowtimeStatus } from "../models/Showtime.model";

// @desc    List movies
// @route   GET /api/movies
// @access  Public
export const getMovies = asyncHandler(async (req: Request, res: Response) => {
    const { status, genre, language, search } = req.query;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    // Build a Mongo filter object conditionally
    const filter: any = {};

    if (status) filter.status = status;
    if (genre) filter.genre = genre; // matches if genre array contains this value
    if (language) filter.language = language;
    if (search) filter.$text = { $search: search as string };

    // Run in parallel
    const [movies, total] = await Promise.all([
        Movie.find(filter)
            .sort({ releaseDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Movie.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        movies,
        pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        }
    });
});

// @desc    Movie details
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid movie ID" });
        return;
    }

    const movie = await Movie.findById(id);

    if (!movie) {
        res.status(404).json({ success: false, message: "Movie not found" });
        return;
    }

    res.status(200).json({
        success: true,
        data: movie,
    });
});

// @desc    Create movie
// @route   POST /api/movies
// @access  Admin
export const createMovie = asyncHandler(async (req: Request, res: Response) => {
    const required = ["title", "description", "releaseDate", "duration", "posterUrl", "bannerUrl"];
    const missing = required.filter((f) => !req.body[f]);

    if (missing.length) {
        res.status(400).json({
            success: false,
            message: `Missing fields: ${missing.join(", ")}`
        });
        return;
    }

    const movie = await Movie.create(req.body);

    res.status(201).json({
        success: true,
        data: movie,
    });
});

// @desc    Update movie
// @route   PUT /api/movies/:id
// @access  Admin
export const updateMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid movie ID" });
        return;
    }

    const movie = await Movie.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!movie) {
        res.status(404).json({ success: false, message: "Movie not found" });
        return;
    }

    res.status(200).json({
        success: true,
        data: movie,
    });
});

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Admin
export const deleteMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid movie ID" });
        return;
    }

    const hasActiveShowtimes = await Showtime.exists({
        movieId: id,
        status: { $in: [ShowtimeStatus.UPCOMING, ShowtimeStatus.LIVE] },
    });

    if (hasActiveShowtimes) {
        res.status(409).json({
            success: false,
            message: "Cannot delete: movie has active showtimes"
        });
        return;
    }

    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
        res.status(404).json({ success: false, message: "Movie not found" });
        return;
    }

    res.status(200).json({
        success: true,
        message: "Movie deleted",
    });
});
