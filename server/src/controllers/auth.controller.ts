import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { CookieOptions } from "express";
import User from "../models/User.model";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { asyncHandler } from "../middleware/asyncHandler";

const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches refresh token expiry
};

// ----------------------
// Helper: issue access + refresh token, persist hashed refresh token
// ----------------------
const issueTokens = async (userId: string, role: string) => {
  const accessToken = generateAccessToken({ userId, role });
  const refreshToken = generateRefreshToken({ userId });

  // Store a HASH of the refresh token, never the raw value.
  // This way a leaked DB doesn't let anyone mint new sessions.
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
  await User.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });

  return { accessToken, refreshToken };
};

// ----------------------
// POST /api/auth/register
// ----------------------
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phoneNumber } = req.body;

  if (!email || !password || !firstName || !lastName) {
    res.status(400).json({
      success: false,
      message: "Email, password, first name and last name are required",
    });
    return;
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
    return;
  }

  const user = await User.create({
    email,
    password, // hashed automatically by the pre-save hook on User.model.ts
    firstName,
    lastName,
    phoneNumber,
  });

  const { accessToken, refreshToken } = await issueTokens(
    user._id.toString(),
    user.role
  );

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  res.status(201).json({
    success: true,
    message: "Account created successfully",
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

// ----------------------
// POST /api/auth/login
// ----------------------
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
    return;
  }

  // password has `select: false` on the schema, so it must be explicitly requested
  const user = await User.findOne({ email: email.toLowerCase() }).select(
    "+password"
  );

  if (!user) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: "Invalid email or password" });
    return;
  }

  const { accessToken, refreshToken } = await issueTokens(
    user._id.toString(),
    user.role
  );

  res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

// ----------------------
// POST /api/auth/refresh-token
// Reads the httpOnly refresh cookie, verifies + rotates it, issues a new pair.
// ----------------------
export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ success: false, message: "Refresh token missing" });
      return;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      res.status(401).json({
        success: false,
        message: "Refresh token invalid or expired, please log in again",
      });
      return;
    }

    const user = await User.findById(decoded.userId).select("+refreshToken");
    if (!user || !user.refreshToken) {
      res.status(401).json({
        success: false,
        message: "Refresh token invalid, please log in again",
      });
      return;
    }

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: "Refresh token invalid, please log in again",
      });
      return;
    }

    // Rotation: every refresh issues a brand new pair, old one is overwritten in DB
    const { accessToken, refreshToken } = await issueTokens(
      user._id.toString(),
      user.role
    );

    res.cookie("refreshToken", refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
    res.status(200).json({ success: true, accessToken });
  }
);

// ----------------------
// POST /api/auth/logout
// ----------------------
export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user?.userId) {
    await User.findByIdAndUpdate(req.user.userId, {
      $unset: { refreshToken: 1 },
    });
  }

  res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// ----------------------
// GET /api/auth/me
// ----------------------
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.userId);

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.status(200).json({
    success: true,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

// ----------------------
// PUT /api/auth/me
// ----------------------
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, phoneNumber, profilePicture } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user?.userId,
    { firstName, lastName, phoneNumber, profilePicture },
    { new: true, runValidators: true }
  );

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
    },
  });
});