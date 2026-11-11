import ApiError from "../utils/ApiError.js";
import { env } from "../config/env.js";

export const notFound = (req, res, next) => {
  next(
    new ApiError(
      404,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  let errors = err.errors || [];

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "This email or resource is already registered.";
  }

  // MongoDB invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  // MongoDB validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed.";

    errors = Object.values(err.errors).map((item) => ({
      field: item.path,
      message: item.message,
    }));
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  if (statusCode === 500 && env.NODE_ENV === "production") {
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(env.NODE_ENV === "development" && {
      stack: err.stack,
    }),
  });
};