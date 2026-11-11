import { Router } from "express";

import { authenticate } from "../middlewares/authenticate.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

import  validate  from "../middlewares/validate.middleware.js";
import { validateQuery } from "../middlewares/validate-query.middleware.js";
import { validateObjectId } from "../middlewares/validate-object-id.middleware.js";

import {
  adminUsersQuerySchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} from "../validations/admin.validation.js";

import {
  getDashboard,
  getUsers,
  getUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} from "../controllers/admin.controller.js";

const router = Router();

// Every admin route requires a valid admin account.
router.use(authenticate);
router.use(authorize("admin"));

router.get("/dashboard", getDashboard);

router.get(
  "/users",
  validateQuery(adminUsersQuerySchema),
  getUsers
);

router.get(
  "/users/:userId",
  validateObjectId,
  getUser
);

router.patch(
  "/users/:userId/role",
  validateObjectId,
  validate(updateUserRoleSchema),
  updateUserRole
);

router.patch(
  "/users/:userId/status",
  validateObjectId,
  validate(updateUserStatusSchema),
  updateUserStatus
);

router.delete(
  "/users/:userId",
  validateObjectId,
  deleteUser
);

export default router;