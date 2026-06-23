import { Router } from "express";
import { initiatePayment, verifyPayment } from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);

export default router;
