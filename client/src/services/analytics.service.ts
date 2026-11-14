
import api from "./api";
import type { ApiResponse } from "@/types/auth";
import type { DashboardAnalytics } from "@/types/analytics";

export const analyticsService = {
  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    const response = await api.get<
      ApiResponse<DashboardAnalytics>
    >("/analytics/dashboard");

    return response.data.data;
  },
};
