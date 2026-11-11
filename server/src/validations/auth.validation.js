import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "../auth/auth.constants.js";

const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "Password must contain at least 8 characters")
  .max(72, "Password must not exceed 72 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(254),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(72),
});

export const emailTokenSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid token"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(254),
});

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i, "Invalid token"),
  password: passwordSchema,
});

export const emptySchema = z.object({});