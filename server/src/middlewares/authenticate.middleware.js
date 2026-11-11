import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { AUTH_COOKIES, TOKEN_TYPES } from "../auth/auth.constants.js";
import { verifyAccessToken } from "../auth/jwt.js";
import { isTokenBlacklisted } from "../services/token-blacklist.service.js";

export const authenticate = asyncHandler(async (req, res, next) => {
  const cookieToken = req.cookies?.[AUTH_COOKIES.ACCESS];

  const authorization = req.headers.authorization;

  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : null;

  const accessToken = cookieToken || bearerToken;

  if (!accessToken) {
    throw new ApiError(401, "Authentication required");
  }

  let decoded;

  try {
    decoded = verifyAccessToken(accessToken);
  } catch {
    throw new ApiError(401, "Invalid or expired access token");
  }

  if (decoded.type !== TOKEN_TYPES.ACCESS || !decoded.jti) {
    throw new ApiError(401, "Invalid access token");
  }

  const blacklisted = await isTokenBlacklisted(decoded.jti);

  if (blacklisted) {
    throw new ApiError(401, "This access token has been revoked");
  }

  const user = await User.findById(decoded.sub);

  if (!user || !user.isActive) {
    throw new ApiError(401, "User account is unavailable");
  }

  req.user = user;
  req.authToken = decoded;

  next();
});