
import api from "./api";
import type { ApiResponse, User } from "@/types/auth";

interface ProfileResponse {
  user: User;
}

export const dashboardService = {
  async getProfile(): Promise<User> {
    const response = await api.get<ApiResponse<ProfileResponse>>(
      "/users/me"
    );

    return response.data.data.user;
  },
};
