import "dotenv/config";
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import { requestLogger } from "./middleware/logger.middleware";

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------
// Middleware
// ----------------------
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // React frontend
    credentials: true,
  })
);

// ----------------------
// Health Check
// ----------------------
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Server is running" });
});

// ----------------------
// Routes
// ----------------------
app.use("/api/auth", authRoutes);

// ----------------------
// Error Handler (should be last)
// ----------------------
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
);

// ----------------------
// Start Server
// ----------------------
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📝 Test with: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();