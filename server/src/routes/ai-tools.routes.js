
import { Router } from "express";

import { authenticate } from "../middlewares/authenticate.middleware.js";
import { requirePermission } from "../middlewares/authorize.middleware.js";
import  validate  from "../middlewares/validate.middleware.js";
import { aiRateLimit } from "../middlewares/ai-rate-limit.middleware.js";

import {
  explainCodeSchema,
  debugCodeSchema,
  fixCodeSchema,
} from "../validations/ai-tools.validation.js";

import {
  explainCodeController,
  debugCodeController,
  fixCodeController
} from "../controllers/ai-tools.controller.js";

const router = Router();

router.use(authenticate);
router.use(requirePermission("code:review"));
router.use(aiRateLimit);

router.post(
  "/explain",
  validate(explainCodeSchema),
  explainCodeController
);

router.post(
  "/debug",
  validate(debugCodeSchema),
  debugCodeController
);
router.post(
  "/fix",
  validate(fixCodeSchema),
  fixCodeController
);
export default router;
