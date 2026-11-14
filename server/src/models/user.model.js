import mongoose from "mongoose";
import { USER_ROLES } from "../auth/auth.constants.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 60,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationTokenHash: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    refreshTokenHash: {
      type: String,
      select: false,
    },

    refreshTokenExpires: {
      type: Date,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    notificationPreferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },

      productUpdates: {
        type: Boolean,
        default: true,
      },

      securityAlerts: {
        type: Boolean,
        default: true,
      },
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
