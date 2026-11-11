
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { env } from "../config/env.js";

export const aiRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,

  limit: env.AI_RATE_LIMIT,

  standardHeaders: "draft-8",
  legacyHeaders: false,

  keyGenerator: (req) => {
    // Authenticated users get their own rate-limit bucket.
    if (req.user?._id) {
      return `user:${req.user._id.toString()}`;
    }

    // Safely normalize IPv4 and IPv6 addresses.
    return `ip:${ipKeyGenerator(req.ip)}`;
  },

  message: {
    success: false,
    message: "AI review limit reached. Try again later.",
  },

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      statusCode: 429,
      message: "AI review limit reached. Try again later.",
    });
  },
});
