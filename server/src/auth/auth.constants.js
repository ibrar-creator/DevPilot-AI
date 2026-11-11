export const USER_ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export const TOKEN_TYPES = Object.freeze({
  ACCESS: "access",
  REFRESH: "refresh",
  EMAIL_VERIFICATION: "email-verification",
  PASSWORD_RESET: "password-reset",
});

export const AUTH_COOKIES = Object.freeze({
  ACCESS: "devpilot_access",
  REFRESH: "devpilot_refresh",
});

export const COOKIE_OPTIONS = Object.freeze({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
});

export const PASSWORD_MIN_LENGTH = 8;