
import api from "./api";
import type { ApiResponse, User } from "@/types/auth";

export interface UpdateProfilePayload {
  name: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface AccountPasswordPayload {
  currentPassword: string;
}

export const userService = {
  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const response = await api.patch<ApiResponse<User>>(
      "/users/me",
      payload
    );

    return response.data.data;
  },

  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.patch("/users/me/password", payload);
  },

  async deactivateAccount(
    payload: AccountPasswordPayload
  ): Promise<void> {
    await api.post("/users/me/deactivate", payload);
  },

  async deleteAccount(
    payload: AccountPasswordPayload
  ): Promise<void> {
    await api.delete("/users/me", {
      data: payload,
    });
  },
};
