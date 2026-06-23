import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { UserRole } from "../models/User.model";

/**
 * Protect routes — verifies the access token sent in the Authorization header.
 * Expected header format: "Authorization: Bearer <accessToken>"
 * On success, attaches { userId, role } to req.user.
 */
export const protect = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Not authorized, no token provided",
    });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);

    req.user = { userId: decoded.userId, role: decoded.role as UserRole };
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized, token invalid or expired",
    });
  }
};

/**
 * Restrict routes to Admin role only.
 * Must be used AFTER `protect` in the middleware chain.
 */
export const adminOnly = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== UserRole.ADMIN) {
    res.status(403).json({
      success: false,
      message: "Access denied: Admins only",
    });
    return;
  }
  next();
};