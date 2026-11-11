import { Router } from "express";

import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import adminRoutes from "./admin.routes.js";

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

export default router;