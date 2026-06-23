import { Router } from "express";
import { createBooking, cancelBooking } from "../controllers/booking.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.route("/").post(createBooking);
router.route("/:id/cancel").put(cancelBooking);

export default router;
