import mongoose from "mongoose";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

const safeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isEmailVerified: user.isEmailVerified,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ensureNotSelf = (targetUserId, adminId) => {
  if (targetUserId.toString() === adminId.toString()) {
    throw new ApiError(403, "You cannot perform this action on your own account");
  }
};

const ensureNotLastActiveAdmin = async (user) => {
  if (user.role !== "admin" || !user.isActive) {
    return;
  }

  const activeAdmins = await User.countDocuments({
    role: "admin",
    isActive: true,
  });

  if (activeAdmins <= 1) {
    throw new ApiError(400, "You cannot remove the last active administrator");
  }
};

// Dashboard statistics
export const getAdminDashboardStats = async () => {
  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  );

  const [
    totalUsers,
    activeUsers,
    blockedUsers,
    verifiedUsers,
    totalAdmins,
    newUsersLastSevenDays,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),
    User.countDocuments({ isEmailVerified: true }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
  ]);

  return {
    totalUsers,
    activeUsers,
    blockedUsers,
    verifiedUsers,
    unverifiedUsers: totalUsers - verifiedUsers,
    totalAdmins,
    newUsersLastSevenDays,
  };
};

// Get all users with search and pagination
export const getAllUsers = async (query) => {
  const {
    page,
    limit,
    search,
    role,
    status,
  } = query;

  const filter = {};

  if (search) {
    const safeSearch = escapeRegex(search);

    filter.$or = [
      { name: { $regex: safeSearch, $options: "i" } },
      { email: { $regex: safeSearch, $options: "i" } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (status === "active") {
    filter.isActive = true;
  }

  if (status === "blocked") {
    filter.isActive = false;
  }

  const skip = (page - 1) * limit;

  const [users, totalUsers] = await Promise.all([
    User.find(filter)
      .select(
        "name email role isEmailVerified isActive lastLoginAt createdAt"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  return {
    users: users.map(safeUser),
    pagination: {
      currentPage: page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      hasNextPage: page * limit < totalUsers,
      hasPreviousPage: page > 1,
    },
  };
};

// Get one user
export const getAdminUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return safeUser(user);
};

// Update role
export const updateAdminUserRole = async (
  userId,
  adminId,
  newRole
) => {
  ensureNotSelf(userId, adminId);

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.role === newRole) {
    return safeUser(user);
  }

  if (user.role === "admin" && newRole !== "admin") {
    await ensureNotLastActiveAdmin(user);
  }

  user.role = newRole;
  await user.save();

  return safeUser(user);
};

// Block or unblock user
export const updateAdminUserStatus = async (
  userId,
  adminId,
  isActive
) => {
  ensureNotSelf(userId, adminId);

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.isActive === isActive) {
    return safeUser(user);
  }

  if (!isActive) {
    await ensureNotLastActiveAdmin(user);
  }

  user.isActive = isActive;

  if (!isActive) {
    user.refreshTokenHash = undefined;
    user.refreshTokenExpiresAt = undefined;
  }

  await user.save();

  return safeUser(user);
};

// Permanently delete user
export const deleteAdminUser = async (userId, adminId) => {
  ensureNotSelf(userId, adminId);

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await ensureNotLastActiveAdmin(user);

  await User.deleteOne({ _id: userId });

  return true;
};