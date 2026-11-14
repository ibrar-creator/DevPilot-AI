
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  explainCode,
  debugCode,
  fixCode,
} from "../services/ai-tools.service.js";

export const explainCodeController = asyncHandler(async (req, res) => {
  const { code, language, context } = req.validatedBody;

const result = await explainCode({
  userId: req.user._id,
  code,
  language,
  context,
});

  return res.status(200).json(
    new ApiResponse(
      200,
      "Code explanation generated successfully",
      result
    )
  );
});

export const debugCodeController = asyncHandler(async (req, res) => {
  const { code, language, errorMessage, context } = req.validatedBody;

const result = await debugCode({
  userId: req.user._id,
  code,
  language,
  errorMessage,
  context,
});

  return res.status(200).json(
    new ApiResponse(
      200,
      "Code debugging completed successfully",
      result
    )
  );
});

export const fixCodeController = asyncHandler(async (req, res) => {
  const { code, language, errorMessage, context } = req.validatedBody;

  const result = await fixCode({
    userId: req.user._id,
    code,
    language,
    errorMessage,
    context,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      "Code fixed successfully",
      result
    )
  );
});
