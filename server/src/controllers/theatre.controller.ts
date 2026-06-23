import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler";
import Theatre from "../models/Theatre.model";

// @desc    List theatres
// @route   GET /api/theatres
// @access  Public
export const getTheatres = asyncHandler(async (req: Request, res: Response) => {
    const { city } = req.query;

    const filter = city ? { city: city as string } : {};
    
    const theatres = await Theatre.find(filter);

    res.status(200).json({
        success: true,
        data: theatres,
    });
});

// @desc    Theatre details
// @route   GET /api/theatres/:id
// @access  Public
export const getTheatreById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid theatre ID" });
        return;
    }

    // populate("screens") to get full screen list
    const theatre = await Theatre.findById(id).populate("screens");

    if (!theatre) {
        res.status(404).json({ success: false, message: "Theatre not found" });
        return;
    }

    res.status(200).json({
        success: true,
        data: theatre,
    });
});

// @desc    Create theatre
// @route   POST /api/theatres
// @access  Admin
export const createTheatre = asyncHandler(async (req: Request, res: Response) => {
    const { name, city, address, basePrice } = req.body;

    if (!name || !city || !address || basePrice === undefined) {
        res.status(400).json({
            success: false,
            message: "Please provide name, city, address, and basePrice",
        });
        return;
    }

    const theatre = await Theatre.create(req.body);

    res.status(201).json({
        success: true,
        data: theatre,
    });
});

// @desc    Update theatre
// @route   PUT /api/theatres/:id
// @access  Admin
export const updateTheatre = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid theatre ID" });
        return;
    }

    // Optionally check if we are unsetting required fields, but Mongoose runValidators covers this if fields are empty
    let theatre = await Theatre.findById(id);

    if (!theatre) {
        res.status(404).json({ success: false, message: "Theatre not found" });
        return;
    }

    theatre = await Theatre.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: theatre,
    });
});
