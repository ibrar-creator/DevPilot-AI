import TokenBlacklist from "../models/token-blacklist.model.js";

export const blacklistAccessToken = async (decodedToken) => {
  if (!decodedToken?.jti || !decodedToken?.sub || !decodedToken?.exp) {
    return;
  }

  const expiresAt = new Date(decodedToken.exp * 1000);

  // Expired tokens do not need to be blacklisted.
  if (expiresAt <= new Date()) {
    return;
  }

  await TokenBlacklist.updateOne(
    { jti: decodedToken.jti },
    {
      $setOnInsert: {
        jti: decodedToken.jti,
        userId: decodedToken.sub,
        expiresAt,
      },
    },
    { upsert: true }
  );
};

export const isTokenBlacklisted = async (jti) => {
  if (!jti) return true;

  const token = await TokenBlacklist.exists({ jti });

  return Boolean(token);
};