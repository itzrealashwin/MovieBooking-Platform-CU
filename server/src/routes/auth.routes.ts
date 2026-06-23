import { Router } from "express";
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

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

// Protected (requires valid access token)
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);

export default router;