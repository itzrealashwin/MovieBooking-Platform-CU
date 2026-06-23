import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes";
dotenv.config();
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser()); // required — refresh token reads req.cookies
app.use("/api/auth", authRoutes);

app.get("/api/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

// Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/movies", movieRoutes);
// app.use("/api/bookings", bookingRoutes);

export default app;