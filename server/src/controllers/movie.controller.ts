import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler";
import Movie from "../models/Movie.model";
import Showtime from "../models/Showtime.model";

// @desc    List movies
// @route   GET /api/movies
// @access  Public
export const getMovies = asyncHandler(async (req: Request, res: Response) => {
    const { status, genre, search, page = "1", limit = "10" } = req.query;

    // Build a Mongo filter object conditionally
    const filter: any = {};

    if (status) {
        filter.status = status;
    }

    if (genre) {
        // If multiple genres are passed, you might need to handle it depending on how the frontend sends it
        filter.genre = { $in: [genre] };
    }

    if (search) {
        filter.title = { $regex: search as string, $options: "i" };
    }

    // Pagination logic
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // Run in parallel
    const [movies, total] = await Promise.all([
        Movie.find(filter).skip(skip).limit(limitNumber),
        Movie.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNumber);

    res.status(200).json({
        success: true,
        data: movies,
        total,
        page: pageNumber,
        totalPages,
    });
});

// @desc    Movie details
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

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
    const { title, description, releaseDate, duration, posterUrl, bannerUrl } = req.body;

    // Basic validation for required fields
    if (!title || !description || !releaseDate || !duration || !posterUrl || !bannerUrl) {
        res.status(400).json({
            success: false,
            message: "Please provide title, description, releaseDate, duration, posterUrl, and bannerUrl",
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
    const { id } = req.params;

    let movie = await Movie.findById(id);

    if (!movie) {
        res.status(404).json({ success: false, message: "Movie not found" });
        return;
    }

    movie = await Movie.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: movie,
    });
});

// @desc    Delete movie
// @route   DELETE /api/movies/:id
// @access  Admin
export const deleteMovie = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const movie = await Movie.findById(id);

    if (!movie) {
        res.status(404).json({ success: false, message: "Movie not found" });
        return;
    }

    // Check no active Showtimes reference this movie
    const activeShowtime = await Showtime.findOne({
        movieId: id,
        status: { $in: ["upcoming", "live"] },
    });

    if (activeShowtime) {
        res.status(409).json({
            success: false,
            message: "Cannot delete movie with active upcoming or live showtimes",
        });
        return;
    }

    await Movie.findByIdAndDelete(id);

    res.status(200).json({
        success: true,
        message: "Movie deleted",
    });
});
