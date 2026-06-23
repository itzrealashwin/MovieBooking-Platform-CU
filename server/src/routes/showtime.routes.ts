import { Router } from "express";
import { getShowtimes, createShowtime } from "../controllers/showtime.controller";
import { getShowtimeSeats } from "../controllers/seat.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

router
  .route("/")
  .get(getShowtimes)
  .post(protect, adminOnly, createShowtime);

router
  .route("/:showtimeId/seats")
  .get(getShowtimeSeats);

export default router;
