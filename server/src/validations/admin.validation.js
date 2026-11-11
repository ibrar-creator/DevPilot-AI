import { z } from "zod";

export const adminUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).default(""),
  role: z.enum(["user", "admin"]).optional(),
  status: z.enum(["active", "blocked"]).optional(),
});

export const updateUserRoleSchema = z
  .object({
    role: z.enum(["user", "admin"]),
  })
  .strict();

export const updateUserStatusSchema = z
  .object({
    isActive: z.boolean(),
  })
  .strict();