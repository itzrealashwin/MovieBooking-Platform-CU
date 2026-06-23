import { Request, Response } from "express";
import mongoose from "mongoose";
import { asyncHandler } from "../middleware/asyncHandler";
import Screen from "../models/Screen.model";
import Theatre from "../models/Theatre.model";

// @desc    Get screens for a theatre
// @route   GET /api/theatres/:theatreId/screens
// @access  Public
export const getScreensByTheatre = asyncHandler(async (req: Request, res: Response) => {
    const { theatreId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(theatreId)) {
        res.status(400).json({ success: false, message: "Invalid theatre ID" });
        return;
    }

    const screens = await Screen.find({ theatreId });

    res.status(200).json({
        success: true,
        data: screens,
    });
});

// @desc    Create a screen
// @route   POST /api/theatres/:theatreId/screens
// @access  Admin
export const createScreen = asyncHandler(async (req: Request, res: Response) => {
    const { theatreId } = req.params;
    const { screenNumber, screenName, capacity, seatMatrix, formats } = req.body;

    if (!mongoose.Types.ObjectId.isValid(theatreId)) {
        res.status(400).json({ success: false, message: "Invalid theatre ID" });
        return;
    }

    if (!screenNumber || !capacity || !seatMatrix) {
        res.status(400).json({ 
            success: false, 
            message: "Please provide screenNumber, capacity, and seatMatrix" 
        });
        return;
    }

    // 1. Verify theatre exists first
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) {
        res.status(404).json({ success: false, message: "Theatre not found" });
        return;
    }

    // 2. Create the screen
    const screen = await Screen.create({
        theatreId,
        screenNumber,
        screenName,
        capacity,
        seatMatrix,
        formats,
    });

    // 3. Push the new screen's _id back onto the theatre
    await Theatre.findByIdAndUpdate(theatreId, {
        $push: { screens: screen._id },
    });

    res.status(201).json({
        success: true,
        data: screen,
    });
});
