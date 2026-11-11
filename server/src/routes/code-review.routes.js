import { Router } from "express";

import { authenticate } from "../middlewares/authenticate.middleware.js";
import { requirePermission } from "../middlewares/authorize.middleware.js";
import  validate  from "../middlewares/validate.middleware.js";
import { aiRateLimit } from "../middlewares/ai-rate-limit.middleware.js";

import { codeReviewSchema } from "../validations/code-review.validation.js";
import { createCodeReview } from "../controllers/code-review.controller.js";

const router = Router();

router.use(authenticate);
router.use(requirePermission("code:review"));
router.use(aiRateLimit);

router.post(
  "/code-review",
  validate(codeReviewSchema),
  createCodeReview
);

export default router;