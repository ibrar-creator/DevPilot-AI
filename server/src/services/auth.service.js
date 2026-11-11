import crypto from "node:crypto";

import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

import {
  hashPassword,
  comparePassword,
} from "./password.service.js";

import {
  createAuthTokens,
  hashToken,
  generateRandomToken,
  revokeRefreshToken,
} from "./token.service.js";

import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "./email.service.js";

import { verifyRefreshToken } from "../auth/jwt.js";
import { TOKEN_TYPES } from "../auth/auth.constants.js";

const TOKEN_EXPIRY = 15 * 60 * 1000;

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  createdAt: user.createdAt,
});

export const registerUser = async ({ name, email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await hashPassword(password);
  const verificationToken = generateRandomToken();

  const user = await User.create({
    name,
    email: normalizedEmail,
    password: hashedPassword,
    emailVerificationTokenHash: hashToken(verificationToken),
    emailVerificationExpires: new Date(Date.now() + TOKEN_EXPIRY),
  });

  try {
    await sendVerificationEmail(user, verificationToken);
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw new ApiError(503, "Unable to send verification email. Please try again.");
  }

  return safeUser(user);
};

export const verifyUserEmail = async (token) => {
  const user = await User.findOne({
    emailVerificationTokenHash: hashToken(token),
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationTokenHash +emailVerificationExpires");

  if (!user) {
    throw new ApiError(400, "Verification link is invalid or expired");
  }

  user.isEmailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpires = undefined;

  await user.save();

  return safeUser(user);
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
  }).select("+password");

  if (!user || !(await comparePassword(password, user.password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  if (!user.isActive) {
    throw new ApiError(403, "Your account is inactive");
  }

  if (!user.isEmailVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  user.lastLoginAt = new Date();

  const tokens = await createAuthTokens(user);

  return {
    user: safeUser(user),
    ...tokens,
  };
};

export const refreshUserSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token required");
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  if (decoded.type !== TOKEN_TYPES.REFRESH) {
    throw new ApiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decoded.sub).select(
    "+refreshTokenHash +refreshTokenExpires"
  );

  if (
    !user ||
    !user.isActive ||
    !user.isEmailVerified ||
    !user.refreshTokenHash ||
    !user.refreshTokenExpires ||
    user.refreshTokenExpires <= new Date()
  ) {
    throw new ApiError(401, "Session expired. Please log in again.");
  }

  const suppliedHash = hashToken(refreshToken);

  const hashesMatch =
    suppliedHash.length === user.refreshTokenHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(suppliedHash, "hex"),
      Buffer.from(user.refreshTokenHash, "hex")
    );

  if (!hashesMatch) {
    await revokeRefreshToken(user._id);
    throw new ApiError(401, "Invalid refresh token");
  }

  const tokens = await createAuthTokens(user);

  return {
    user: safeUser(user),
    ...tokens,
  };
};

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;

  try {
    const decoded = verifyRefreshToken(refreshToken);

    if (decoded.type === TOKEN_TYPES.REFRESH) {
      const user = await User.findById(decoded.sub).select(
        "+refreshTokenHash"
      );

      if (
        user?.refreshTokenHash &&
        hashToken(refreshToken) === user.refreshTokenHash
      ) {
        await revokeRefreshToken(user._id);
      }
    }
  } catch {
    // Invalid or expired tokens are already unusable.
  }
};

export const getCurrentUser = (user) => safeUser(user);

export const forgotUserPassword = async (email) => {
  const user = await User.findOne({
    email: email.toLowerCase().trim(),
    isActive: true,
  });

  const genericMessage =
    "If an eligible account exists, a password reset email will be sent.";

  if (!user) return genericMessage;

  const token = generateRandomToken();

  user.passwordResetTokenHash = hashToken(token);
  user.passwordResetExpires = new Date(Date.now() + TOKEN_EXPIRY);

  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user, token);
  } catch {
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    throw new ApiError(503, "Unable to send password reset email");
  }

  return genericMessage;
};

export const resetUserPassword = async ({ token, password }) => {
  const user = await User.findOne({
    passwordResetTokenHash: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select(
    "+passwordResetTokenHash +passwordResetExpires"
  );

  if (!user) {
    throw new ApiError(400, "Password reset link is invalid or expired");
  }

  user.password = await hashPassword(password);

  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;

  user.refreshTokenHash = undefined;
  user.refreshTokenExpires = undefined;

  await user.save();

  return safeUser(user);
};