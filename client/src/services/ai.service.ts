
import api from "./api";
import type { ApiResponse } from "@/types/auth";

import type {
  CodeReviewPayload,
  CodeReviewResult,
  CodeExplanationPayload,
  CodeExplanationResult,
  CodeDebugPayload,
  CodeDebugResult,
  TestCasePayload,
  TestCaseGenerationResult,
} from "@/types/ai";

export const aiService = {
  async reviewCode(
    payload: CodeReviewPayload
  ): Promise<CodeReviewResult> {
    const response = await api.post<ApiResponse<CodeReviewResult>>(
      "/ai/code-review",
      payload
    );

    return response.data.data;
  },

  async explainCode(
    payload: CodeExplanationPayload
  ): Promise<CodeExplanationResult> {
    const response = await api.post<ApiResponse<CodeExplanationResult>>(
      "/ai/explain",
      payload
    );

    return response.data.data;
  },

  async debugCode(
    payload: CodeDebugPayload
  ): Promise<CodeDebugResult> {
    const response = await api.post<ApiResponse<CodeDebugResult>>(
      "/ai/debug",
      payload
    );

    return response.data.data;
  },

  async generateTestCases(
    payload: TestCasePayload
  ): Promise<TestCaseGenerationResult> {
    const response = await api.post<
      ApiResponse<TestCaseGenerationResult>
    >("/ai/test-cases", payload);

    return response.data.data;
  },
};
