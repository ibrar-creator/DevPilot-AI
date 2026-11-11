import crypto from "node:crypto";
import User from "../models/user.model.js";
import {
  signAccessToken,
  signRefreshToken,
} from "../auth/jwt.js";

export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

export const createAuthTokens = async (user) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  user.refreshTokenHash = hashToken(refreshToken);

  // Keep database expiry aligned with refresh JWT expiry.
  const expiresIn = process.env.JWT_REFRESH_EXPIRES || "7d";
  const match = expiresIn.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error("Invalid JWT_REFRESH_EXPIRES configuration");
  }

  const units = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  user.refreshTokenExpires = new Date(
    Date.now() + Number(match[1]) * units[match[2]]
  );

  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const revokeRefreshToken = async (userId) => {
  await User.findByIdAndUpdate(userId, {
    $unset: {
      refreshTokenHash: 1,
      refreshTokenExpires: 1,
    },
  });
};