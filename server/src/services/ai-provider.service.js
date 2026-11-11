import { env } from "../config/env.js";
import ApiError from "../utils/ApiError.js";

const extractJson = (text) => {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  return JSON.parse(cleaned);
};

export const generateAIResponse = async ({
  systemInstruction,
  userPrompt,
}) => {
  if (!env.GEMINI_API_KEY) {
    throw new ApiError(
      503,
      "AI service is not configured. Please configure GEMINI_API_KEY."
    );
  }

  const model = env.GEMINI_MODEL;

  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  );

  url.searchParams.set("key", env.GEMINI_API_KEY);

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(60000),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },

        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],

        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          maxOutputTokens: 8192,
        },
      }),
    });
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      throw new ApiError(504, "AI service request timed out");
    }

    throw new ApiError(503, "Unable to connect to AI service");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    console.error("Gemini API error:", {
      status: response.status,
      message: errorData.error?.message,
    });

    if (response.status === 429) {
      throw new ApiError(
        503,
        "AI provider quota or rate limit reached. Please try again later."
      );
    }

    if (response.status === 401 || response.status === 403) {
      throw new ApiError(
        503,
        "AI provider authentication failed. Check your API key."
      );
    }

    throw new ApiError(502, "AI provider could not process this request");
  }

  const data = await response.json();

  const candidate = data.candidates?.[0];

  if (!candidate || candidate.finishReason === "SAFETY") {
    throw new ApiError(422, "AI could not review the submitted code");
  }

  const text = candidate.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new ApiError(502, "AI provider returned an empty response");
  }

  let result;

  try {
    result = extractJson(text);
  } catch {
    throw new ApiError(502, "AI provider returned an invalid review format");
  }

  return {
    result,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
    },
    model,
  };
};