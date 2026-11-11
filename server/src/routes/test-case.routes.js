import { Router } from "express";

import { authenticate } from "../middlewares/authenticate.middleware.js";
import { requirePermission } from "../middlewares/authorize.middleware.js";
import  validate  from "../middlewares/validate.middleware.js";
import { aiRateLimit } from "../middlewares/ai-rate-limit.middleware.js";

import { generateTestCasesSchema } from "../validations/test-case.validation.js";
import { generateTestCasesController } from "../controllers/test-case.controller.js";

const router = Router();

router.use(authenticate);
router.use(requirePermission("code:review"));
router.use(aiRateLimit);

router.post(
  "/test-cases",
  validate(generateTestCasesSchema),
  generateTestCasesController
);

export default router;