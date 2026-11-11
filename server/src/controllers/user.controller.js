import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  deactivateUserAccount,
  deleteUserAccount,
} from "../services/user.service.js";

import {
  blacklistAccessToken,
} from "../services/token-blacklist.service.js";

import {
  logoutUser,
} from "../services/auth.service.js";

import {
  AUTH_COOKIES,
  COOKIE_OPTIONS,
} from "../auth/auth.constants.js";

const clearAuthCookies = (res) => {
  res.clearCookie(AUTH_COOKIES.ACCESS, COOKIE_OPTIONS);
  res.clearCookie(AUTH_COOKIES.REFRESH, COOKIE_OPTIONS);
};

// GET /users/me
export const getProfile = asyncHandler(async (req, res) => {
  const user = await getUserProfile(req.user._id);

  return res.status(200).json(
    new ApiResponse(200, "Profile fetched successfully", user)
  );
});

// PATCH /users/me
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateUserProfile(
    req.user._id,
    req.validatedBody
  );

  return res.status(200).json(
    new ApiResponse(200, "Profile updated successfully", user)
  );
});

// PATCH /users/me/password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.validatedBody;

  const user = await changeUserPassword(
    req.user._id,
    currentPassword,
    newPassword
  );

  // Revoke the current access token.
  await blacklistAccessToken(req.authToken);

  // Clear the browser's authentication cookies.
  clearAuthCookies(res);

  return res.status(200).json(
    new ApiResponse(
      200,
      "Password changed successfully. Please log in again.",
      user
    )
  );
});

// POST /users/me/deactivate
export const deactivateAccount = asyncHandler(async (req, res) => {
  await deactivateUserAccount(
    req.user._id,
    req.validatedBody.currentPassword
  );

  await blacklistAccessToken(req.authToken);

  await logoutUser(
    req.cookies?.[AUTH_COOKIES.REFRESH]
  );

  clearAuthCookies(res);

  return res.status(200).json(
    new ApiResponse(200, "Account deactivated successfully")
  );
});

// DELETE /users/me
export const deleteAccount = asyncHandler(async (req, res) => {
  await deleteUserAccount(
    req.user._id,
    req.validatedBody.currentPassword
  );

  await blacklistAccessToken(req.authToken);

  await logoutUser(
    req.cookies?.[AUTH_COOKIES.REFRESH]
  );

  clearAuthCookies(res);

  return res.status(200).json(
    new ApiResponse(200, "Account permanently deleted")
  );
});