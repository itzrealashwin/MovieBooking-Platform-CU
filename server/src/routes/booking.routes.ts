import { Router } from "express";
import { createBooking, cancelBooking, getUserBookings, getBookingById } from "../controllers/booking.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect);

router.route("/").post(createBooking);
router.route("/").get(getUserBookings);
router.route("/:id/cancel").put(cancelBooking);
router.route("/:id").get(getBookingById);

export default router;
