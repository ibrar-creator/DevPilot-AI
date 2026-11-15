
import mongoose from "mongoose";

const aiActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tool: {
      type: String,
      enum: [
        "code-review",
        "code-explainer",
        "ai-debugger",
        "test-generator",
        "code-fixer",
        "chat"
      ],
      required: true,
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
      min: 0,
    },

    promptTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    outputTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalTokens: {
      type: Number,
      default: 0,
      min: 0,
    },

    score: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    issueCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    bugCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    testCaseCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

aiActivitySchema.index({ userId: 1, createdAt: -1 });
aiActivitySchema.index({ userId: 1, tool: 1, createdAt: -1 });

const AIActivity = mongoose.model("AIActivity", aiActivitySchema);

export default AIActivity;
