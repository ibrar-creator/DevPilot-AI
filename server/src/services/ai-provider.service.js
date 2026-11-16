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
      signal: AbortSignal.timeout(300000),
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
          maxOutputTokens: 32768,
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
export const generateAIChatResponse = async ({
  systemInstruction,
  messages,
}) => {
  if (!env.GEMINI_API_KEY) {
    throw new ApiError(
      503,
      "AI service is not configured. Please configure GEMINI_API_KEY."
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, "Chat messages are required");
  }

  const model = env.GEMINI_MODEL;

  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`
  );

  url.searchParams.set("key", env.GEMINI_API_KEY);

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(300000),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },

        contents,

        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 32768,
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

    console.error("Gemini Chat API error:", {
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
    throw new ApiError(422, "AI could not generate a response");
  }

  const text = candidate.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new ApiError(502, "AI provider returned an empty response");
  }

  return {
    text,
    usage: {
      promptTokens: data.usageMetadata?.promptTokenCount || 0,
      outputTokens: data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: data.usageMetadata?.totalTokenCount || 0,
    },
    model,
  };
};
export const generateAIChatStream = async ({
  systemInstruction,
  messages,
  onChunk,
  signal,
}) => {
  if (!env.GEMINI_API_KEY) {
    throw new ApiError(
      503,
      "AI service is not configured. Please configure GEMINI_API_KEY."
    );
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, "Chat messages are required");
  }

  const model = env.GEMINI_MODEL;

  const url = new URL(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent`
  );

  url.searchParams.set("key", env.GEMINI_API_KEY);
  url.searchParams.set("alt", "sse");

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.any([
        signal ?? new AbortController().signal,
        AbortSignal.timeout(300000),
      ]),
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 32768,
        },
      }),
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      throw new ApiError(504, "AI service request timed out");
    }

    if (error.name === "AbortError") {
      throw error;
    }

    throw new ApiError(503, "Unable to connect to AI service");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    console.error("Gemini Streaming API error:", {
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

  if (!response.body) {
    throw new ApiError(502, "AI provider returned an empty stream");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let generatedText = "";
  let usage = {
    promptTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };

  const processLine = (line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine.startsWith("data:")) {
      return;
    }

    const data = trimmedLine.slice(5).trim();

    if (!data || data === "[DONE]") {
      return;
    }

    let chunk;

    try {
      chunk = JSON.parse(data);
    } catch {
      return;
    }

    if (chunk.error) {
      throw new ApiError(502, "Gemini streaming generation failed");
    }

    const candidate = chunk.candidates?.[0];

    if (candidate?.finishReason === "SAFETY") {
      throw new ApiError(422, "AI could not generate a response");
    }

    const text = candidate?.content?.parts
      ?.map((part) => part.text || "")
      .join("");

    if (text) {
      generatedText += text;
      onChunk(text);
    }

    if (chunk.usageMetadata) {
      usage = {
        promptTokens: chunk.usageMetadata.promptTokenCount || 0,
        outputTokens: chunk.usageMetadata.candidatesTokenCount || 0,
        totalTokens: chunk.usageMetadata.totalTokenCount || 0,
      };
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        processLine(line);
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      processLine(buffer);
    }
  } catch (error) {
    await reader.cancel().catch(() => {});

    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw error;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(502, "AI streaming response failed");
  } finally {
    reader.releaseLock();
  }

  if (!generatedText.trim()) {
    throw new ApiError(502, "AI provider returned an empty response");
  }

  return {
    text: generatedText,
    usage,
    model,
  };
};