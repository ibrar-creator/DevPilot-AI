
import { Router } from "express";
import testCaseRoutes from "./test-case.routes.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";
import codeReviewRoutes from "./code-review.routes.js";
import aiToolsRoutes from "./ai-tools.routes.js";

import ApiResponse from "../utils/ApiResponse.js";

const router = Router();

router.get("/health", (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, "DevPilot AI API is healthy", {
      service: "DevPilot AI",
      status: "healthy",
    })
  );
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/admin", adminRoutes);

// Existing code review
router.use("/ai", codeReviewRoutes);

// Code explainer and bug fixer
router.use("/ai", aiToolsRoutes);
// Test case generator
router.use("/ai", testCaseRoutes);
export default router;
