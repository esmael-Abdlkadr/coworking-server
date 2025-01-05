import HttpError from "./HttpError.js";
import logger from "../config/logger.js";

const errorMiddleware = (err, req, res, next) => {
  // Log the error to Sentry
  logger.error(err);

  // Set default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  } else if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  } else if (err.statusCode === 429) {
    // Handle rate limiting error
    statusCode = 429;
    message = "Too many reservation attempts. Please try again after 24 hours.";
  } else if (err.statusCode === 404) {
    message = "Resource not found";
  }

  // Send error response
  res.status(statusCode).json({
    status: "error",
    message,
  });
};

export { errorMiddleware };
