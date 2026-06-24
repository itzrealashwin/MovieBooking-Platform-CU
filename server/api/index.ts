import connectDB from "../src/config/db";
import app from "../src/app";

// Connect to the database
connectDB();

// Export the express app for Vercel
export default app;
