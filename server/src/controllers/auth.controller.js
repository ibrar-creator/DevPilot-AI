import * as authService from "../services/auth.service.js";
import { verifyAccessToken } from "../auth/jwt.js";
import { blacklistAccessToken } from "../services/token-blacklist.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

import {
  AUTH_COOKIES,
  COOKIE_OPTIONS,
} from "../auth/auth.constants.js";

const ACCESS_COOKIE_AGE = 15 * 60 * 1000;
const REFRESH_COOKIE_AGE = 7 * 24 * 60 * 60 * 1000;

const setAuthCookies = (res, tokens) => {
  res.cookie(
    AUTH_COOKIES.ACCESS,
    tokens.accessToken,
    {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_COOKIE_AGE,
    }
  );

  res.cookie(
    AUTH_COOKIES.REFRESH,
    tokens.refreshToken,
    {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_COOKIE_AGE,
    }
  );
};

const clearAuthCookies = (res) => {
  res.clearCookie(AUTH_COOKIES.ACCESS, COOKIE_OPTIONS);
  res.clearCookie(AUTH_COOKIES.REFRESH, COOKIE_OPTIONS);
};

export const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.validatedBody);

  res.status(201).json(
    new ApiResponse(
      201,
      "Registration successful. Please verify your email.",
      { user }
    )
  );
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await authService.verifyUserEmail(
    req.validatedBody.token
  );

  res.status(200).json(
    new ApiResponse(200, "Email verified successfully", { user })
  );
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.validatedBody);

  setAuthCookies(res, result);

  res.status(200).json(
    new ApiResponse(200, "Login successful", {
      user: result.user,
    })
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[AUTH_COOKIES.REFRESH];

  const result = await authService.refreshUserSession(refreshToken);

  setAuthCookies(res, result);

  res.status(200).json(
    new ApiResponse(200, "Session refreshed successfully", {
      user: result.user,
    })
  );
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[AUTH_COOKIES.REFRESH];
  const accessToken = req.cookies?.[AUTH_COOKIES.ACCESS];

  // Blacklist the current access token if it is still valid.
  if (accessToken) {
    try {
      const decoded = verifyAccessToken(accessToken);

      await blacklistAccessToken(decoded);
    } catch {
      // Invalid or expired access tokens need no blacklist entry.
    }
  }

  // Revoke the stored refresh-token session.
await authService.logoutUser(refreshToken);

  clearAuthCookies(res);

  return res.status(200).json(
    new ApiResponse(200, "Logged out successfully")
  );
});
export const forgotPassword = asyncHandler(async (req, res) => {
  const message = await authService.forgotUserPassword(
    req.validatedBody.email
  );

  res.status(200).json(
    new ApiResponse(200, message)
  );
});

export const resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetUserPassword(
    req.validatedBody
  );

  clearAuthCookies(res);

  res.status(200).json(
    new ApiResponse(200, "Password reset successful. Please log in again.", {
      user,
    })
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const user = authService.getCurrentUser(req.user);

  res.status(200).json(
    new ApiResponse(200, "User profile retrieved", { user })
  );
});