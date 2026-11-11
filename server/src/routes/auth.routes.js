import { Router } from "express";

import * as authController from "../controllers/auth.controller.js";

import validate from "../middlewares/validate.middleware.js";
import {authenticate }from "../middlewares/authenticate.middleware.js";
import { authRateLimit } from "../middlewares/authRateLimit.middleware.js";

import {
  registerSchema,
  loginSchema,
  emailTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validations/auth.validation.js";

const router = Router();

// Public routes

router.post(
  "/register",
  authRateLimit,
  validate(registerSchema),
  authController.register
);

router.post(
  "/verify-email",
  authRateLimit,
  validate(emailTokenSchema),
  authController.verifyEmail
);

router.post(
  "/login",
  authRateLimit,
  validate(loginSchema),
  authController.login
);

router.post(
  "/refresh",
  authRateLimit,
  authController.refresh
);

router.post(
  "/logout",
  authController.logout
);

router.post(
  "/forgot-password",
  authRateLimit,
  validate(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  "/reset-password",
  authRateLimit,
  validate(resetPasswordSchema),
  authController.resetPassword
);

// Protected route

router.get(
  "/me",
  authenticate,
  authController.getMe
);

export default router;