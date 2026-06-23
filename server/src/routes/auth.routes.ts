import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  updateMe,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many login attempts, please try again later."
});

// Public
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/refresh-token", refreshAccessToken);

// Protected (requires valid access token)
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

export default router;