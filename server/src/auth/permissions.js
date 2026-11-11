import { USER_ROLES } from "./auth.constants.js";

export const ROLE_PERMISSIONS = Object.freeze({
  [USER_ROLES.USER]: [
    "profile:read",
    "profile:update",
    "ai:chat",
    "code:review",
  ],

  [USER_ROLES.ADMIN]: [
    "profile:read",
    "profile:update",
    "ai:chat",
    "code:review",
    "users:read",
    "users:manage",
    "admin:access",
  ],
});