import { Router } from "express";
import rateLimit from "express-rate-limit";
import { lockSeats, unlockSeats, extendLock } from "../controllers/seat.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Rate limiter for seat lock attempts (e.g., max 20 per 15 minutes)
const lockLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many seat lock attempts, please try again later."
});

// All locking mechanisms require a valid user session
router.use(protect);

router.post("/lock", lockLimiter, lockSeats);
router.post("/unlock", unlockSeats);
router.post("/extend-lock", extendLock);

export default router;
