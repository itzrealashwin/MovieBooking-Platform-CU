import { Request, Response, NextFunction } from "express";

/**
 * Middleware to log all API requests and their response times.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, originalUrl } = req;

  // Listen for the 'finish' event to calculate the response time
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Determine color based on status code for better readability
    let statusColor = "\x1b[32m"; // Green for 200s/300s
    if (statusCode >= 400 && statusCode < 500) {
      statusColor = "\x1b[33m"; // Yellow for 4xx errors
    } else if (statusCode >= 500) {
      statusColor = "\x1b[31m"; // Red for 5xx errors
    }
    const resetColor = "\x1b[0m"; // Reset to default terminal color

    console.log(
      `[${new Date().toISOString()}] ${method} ${originalUrl} -> ${statusColor}${statusCode}${resetColor} - ${duration}ms`
    );
  });

  next();
};
