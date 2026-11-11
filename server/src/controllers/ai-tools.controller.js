
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  explainCode,
  debugCode,
} from "../services/ai-tools.service.js";

export const explainCodeController = asyncHandler(async (req, res) => {
  const { code, language, context } = req.validatedBody;

  const result = await explainCode({
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
