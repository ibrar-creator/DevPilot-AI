
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  getDashboardAnalytics,
} from "../services/analytics.service.js";

export const getDashboardAnalyticsController = asyncHandler(
  async (req, res) => {
    const analytics = await getDashboardAnalytics(req.user._id);

    return res.status(200).json(
      new ApiResponse(
        200,
        "Dashboard analytics fetched successfully",
        analytics
      )
    );
  }
);
