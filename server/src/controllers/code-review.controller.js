import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { reviewCode } from "../services/code-review.service.js";

export const createCodeReview = asyncHandler(async (req, res) => {
  const { code, language, context } = req.validatedBody;

  const result = await reviewCode({
    userId: req.user._id,
    code,
    language,
    context,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Code review completed successfully",
      result
    )
  );
});