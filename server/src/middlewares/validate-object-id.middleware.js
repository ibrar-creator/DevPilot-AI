import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";

export const validateObjectId = (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    return next(new ApiError(400, "Invalid user ID"));
  }

  next();
};