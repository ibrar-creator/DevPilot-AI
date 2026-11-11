import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";

import {
  getAdminDashboardStats,
  getAllUsers,
  getAdminUserById,
  updateAdminUserRole,
  updateAdminUserStatus,
  deleteAdminUser,
} from "../services/admin.service.js";

// GET /admin/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await getAdminDashboardStats();

  return res.status(200).json(
    new ApiResponse(200, "Admin dashboard statistics fetched", stats)
  );
});

// GET /admin/users
export const getUsers = asyncHandler(async (req, res) => {
  const result = await getAllUsers(req.validatedQuery);

  return res.status(200).json(
    new ApiResponse(200, "Users fetched successfully", result)
  );
});

// GET /admin/users/:userId
export const getUser = asyncHandler(async (req, res) => {
  const user = await getAdminUserById(req.params.userId);

  return res.status(200).json(
    new ApiResponse(200, "User fetched successfully", user)
  );
});

// PATCH /admin/users/:userId/role
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await updateAdminUserRole(
    req.params.userId,
    req.user._id,
    req.validatedBody.role
  );

  return res.status(200).json(
    new ApiResponse(200, "User role updated successfully", user)
  );
});

// PATCH /admin/users/:userId/status
export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await updateAdminUserStatus(
    req.params.userId,
    req.user._id,
    req.validatedBody.isActive
  );

  return res.status(200).json(
    new ApiResponse(200, "User status updated successfully", user)
  );
});

// DELETE /admin/users/:userId
export const deleteUser = asyncHandler(async (req, res) => {
  await deleteAdminUser(
    req.params.userId,
    req.user._id
  );

  return res.status(200).json(
    new ApiResponse(200, "User permanently deleted")
  );
});