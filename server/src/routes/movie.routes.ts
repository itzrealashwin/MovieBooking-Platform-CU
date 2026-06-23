import { Router } from "express";
import {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} from "../controllers/movie.controller";
import { protect, adminOnly } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.route("/").get(getMovies).post(protect, adminOnly, createMovie);

// Public (GET) and Admin (PUT, DELETE) routes for specific movie ID
router
  .route("/:id")
  .get(getMovieById)
  .put(protect, adminOnly, updateMovie)
  .delete(protect, adminOnly, deleteMovie);

export default router;
