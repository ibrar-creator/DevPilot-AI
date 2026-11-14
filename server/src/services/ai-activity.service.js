
import AIActivity from "../models/ai/ai-activity.model.js";

export const logAIActivity = async ({
  userId,
  tool,
  language,
  model,
  code,
  usage,
  score = null,
  issueCount = 0,
  bugCount = 0,
  testCaseCount = 0,
}) => {
  try {
    await AIActivity.create({
      userId,
      tool,
      language,
      model,
      codeLength: code.length,
      promptTokens: usage?.promptTokens ?? 0,
      outputTokens: usage?.outputTokens ?? 0,
      totalTokens: usage?.totalTokens ?? 0,
      score,
      issueCount,
      bugCount,
      testCaseCount,
    });
  } catch (error) {
    // Analytics failure must not fail a successful AI request.
    console.error("AI activity logging failed:", error.message);
  }
};
