import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middleware/logger.middleware";

// Routes
import authRoutes from "./routes/auth.routes";
import movieRoutes from "./routes/movie.routes";

const app = express();

// ----------------------
// Middleware
// ----------------------
app.use(requestLogger);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || process.env.CLIENT_URL,
    credentials: true,
  })
);

// ----------------------
// Health Check
// ----------------------
app.get(["/health", "/api/health"], (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Server is running" });
});

// ----------------------
// Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);

// ----------------------
// Error Handler (should be last)
// ----------------------
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
);

export default app;
