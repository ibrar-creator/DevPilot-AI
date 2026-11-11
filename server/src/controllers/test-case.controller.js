import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { generateTestCases } from "../services/test-case.service.js";

export const generateTestCasesController = asyncHandler(
  async (req, res) => {
    const { code, language, framework, context } = req.validatedBody;

    const result = await generateTestCases({
      code,
      language,
      framework,
      context,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Test cases generated successfully",
        result
      )
    );
  }
);