
import { Router } from "express";

import {
  getDashboardAnalyticsController,
} from "../controllers/analytics.controller.js";

import { authenticate } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  getDashboardAnalyticsController
);

export default router;
