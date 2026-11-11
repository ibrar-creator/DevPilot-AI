import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      expires: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const TokenBlacklist = mongoose.model(
  "TokenBlacklist",
  tokenBlacklistSchema
);

export default TokenBlacklist;