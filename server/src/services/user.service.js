import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import {
  hashPassword,
  comparePassword,
} from "./password.service.js";

const safeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  isActive: user.isActive,
  createdAt: user.createdAt,
});

const getUserWithPassword = async (userId) => {
  const user = await User.findById(userId).select("+password");

  if (!user || !user.isActive) {
    throw new ApiError(404, "User account not found");
  }

  return user;
};

// Get profile
export const getUserProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, "User account not found");
  }

  return safeUser(user);
};

// Update profile
export const updateUserProfile = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new ApiError(404, "User account not found");
  }

  user.name = data.name;
  await user.save();

  return safeUser(user);
};

// Change password
export const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword
) => {
  const user = await getUserWithPassword(userId);

  const isPasswordCorrect = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.password = await hashPassword(newPassword);

  // Revoke the existing refresh-token session.
  user.refreshTokenHash = undefined;
  user.refreshTokenExpiresAt = undefined;

  await user.save();

  return safeUser(user);
};

// Deactivate account (soft deactivation)
export const deactivateUserAccount = async (
  userId,
  currentPassword
) => {
  const user = await getUserWithPassword(userId);

  const isPasswordCorrect = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  user.isActive = false;
  user.refreshTokenHash = undefined;
  user.refreshTokenExpiresAt = undefined;

  await user.save();

  return true;
};

// Permanently delete account
export const deleteUserAccount = async (
  userId,
  currentPassword
) => {
  const user = await getUserWithPassword(userId);

  const isPasswordCorrect = await comparePassword(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  await User.deleteOne({ _id: userId });

  return true;
};