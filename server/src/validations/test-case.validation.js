import { z } from "zod";
import { env } from "../config/env.js";

export const generateTestCasesSchema = z
  .object({
    code: z
      .string()
      .min(1, "Code is required")
      .max(
        env.AI_MAX_CODE_LENGTH,
        `Code cannot exceed ${env.AI_MAX_CODE_LENGTH} characters`
      ),

    language: z
      .string()
      .trim()
      .min(1, "Programming language is required")
      .max(50),

    framework: z
      .enum(["jest", "vitest", "auto"])
      .optional()
      .default("auto"),

    context: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .default(""),
  })
  .strict();