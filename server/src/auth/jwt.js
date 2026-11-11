import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import {env} from "../config/env.js";

export const signAccessToken = (userId) => {
  return jwt.sign(
    {
      sub: userId.toString(),
      type: "access",
      jti: randomUUID(),
    },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES,
      issuer: "devpilot-ai",
      audience: "devpilot-ai-client",
    }
  );
};

export const signRefreshToken = (userId) => {
  return jwt.sign(
    {
      sub: userId.toString(),
      type: "refresh",
    },
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES,
      issuer: "devpilot-ai",
      audience: "devpilot-ai-client",
    }
  );
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: "devpilot-ai",
    audience: "devpilot-ai-client",
  });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: "devpilot-ai",
    audience: "devpilot-ai-client",
  });
};