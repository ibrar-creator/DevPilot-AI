
import api from "./api";
import type {
  ApiResponse,
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types/auth";

export const authService = {
  async register(payload: RegisterPayload): Promise<User> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      payload
    );
    return response.data.data.user;
  },

  async login(payload: LoginPayload): Promise<User> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      payload
    );
    return response.data.data.user;
  },

  async verifyEmail(token: string): Promise<User> {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/verify-email",
      { token }
    );
    return response.data.data.user;
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<AuthResponse>>("/auth/me");
    return response.data.data.user;
  },

  async refresh(): Promise<User> {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/refresh");
    return response.data.data.user;
  },

async forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
},

async resetPassword(token: string, password: string): Promise<void> {
  await api.post("/auth/reset-password", { token, password });
},

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },
};
