import { Router } from "express";
import rateLimit from "express-rate-limit";
import { initiatePayment, verifyPayment, getPaymentStatus } from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Rate limiter for payment verification (e.g., max 5 per 15 minutes)
const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many payment verification attempts, please try again later."
});

router.use(protect);

router.post("/initiate", initiatePayment);
router.post("/verify", verifyLimiter, verifyPayment);

// GET payment status for a booking
router.get("/:bookingId", getPaymentStatus);

export default router;
