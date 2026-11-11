
import { z } from "zod";
import { env } from "../config/env.js";

const codeField = z
  .string()
  .min(1, "Code is required")
  .max(
    env.AI_MAX_CODE_LENGTH,
    `Code cannot exceed ${env.AI_MAX_CODE_LENGTH} characters`
  );

const languageField = z
  .string()
  .trim()
  .min(1, "Programming language is required")
  .max(50);

const contextField = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .default("");

export const explainCodeSchema = z
  .object({
    code: codeField,
    language: languageField,
    context: contextField,
  })
  .strict();

export const debugCodeSchema = z
  .object({
    code: codeField,
    language: languageField,
    errorMessage: z
      .string()
      .trim()
      .max(5000)
      .optional()
      .default(""),
    context: contextField,
  })
  .strict();
