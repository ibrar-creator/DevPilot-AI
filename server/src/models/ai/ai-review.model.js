import mongoose from "mongoose";

const aiReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    language: {
      type: String,
      required: true,
      maxlength: 50,
    },

    model: {
      type: String,
      required: true,
    },

    codeLength: {
      type: Number,
      required: true,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true,
    },

    promptTokens: {
      type: Number,
      default: 0,
    },

    outputTokens: {
      type: Number,
      default: 0,
    },

    totalTokens: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

aiReviewSchema.index({ userId: 1, createdAt: -1 });

const AIReview = mongoose.model("AIReview", aiReviewSchema);

export default AIReview;