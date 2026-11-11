import { Router } from "express";

import { authenticate } from "../middlewares/authenticate.middleware.js";
import validate  from "../middlewares/validate.middleware.js";

import {
  updateProfileSchema,
  changePasswordSchema,
  accountPasswordSchema,
} from "../validations/user.validation.js";

import {
  getProfile,
  updateProfile,
  changePassword,
  deactivateAccount,
  deleteAccount,
} from "../controllers/user.controller.js";

const router = Router();

// All user routes require authentication.
router.use(authenticate);

router.get("/me", getProfile);

router.patch(
  "/me",
  validate(updateProfileSchema),
  updateProfile
);

router.patch(
  "/me/password",
  validate(changePasswordSchema),
  changePassword
);

router.post(
  "/me/deactivate",
  validate(accountPasswordSchema),
  deactivateAccount
);

router.delete(
  "/me",
  validate(accountPasswordSchema),
  deleteAccount
);

export default router;