import { Router } from "express";
import {
  getTheatres,
  getTheatreById,
  createTheatre,
  updateTheatre,
} from "../controllers/theatre.controller";
import { getScreensByTheatre, createScreen } from "../controllers/screen.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.route("/").get(getTheatres).post(protect, adminOnly, createTheatre);

// Screen routes for a specific theatre
router
  .route("/:theatreId/screens")
  .get(getScreensByTheatre)
  .post(protect, adminOnly, createScreen);

// Public (GET) and Admin (PUT) routes for specific theatre ID
router
  .route("/:id")
  .get(getTheatreById)
  .put(protect, adminOnly, updateTheatre);

export default router;
