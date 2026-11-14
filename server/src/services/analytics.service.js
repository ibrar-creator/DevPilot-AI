
import AIActivity from "../models/ai/ai-activity.model.js";

export const getDashboardAnalytics = async (userId) => {
  const now = new Date();

  const monthStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );

  const [overallStats, monthlyStats, recentActivities] =
    await Promise.all([
      AIActivity.aggregate([
        {
          $match: {
            userId,
          },
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            codeReviews: {
              $sum: {
                $cond: [{ $eq: ["$tool", "code-review"] }, 1, 0],
              },
            },
            codeExplanations: {
              $sum: {
                $cond: [{ $eq: ["$tool", "code-explainer"] }, 1, 0],
              },
            },
            debugSessions: {
              $sum: {
                $cond: [{ $eq: ["$tool", "ai-debugger"] }, 1, 0],
              },
            },
            testsGenerated: {
              $sum: "$testCaseCount",
            },
            bugsDetected: {
              $sum: "$bugCount",
            },
            totalTokens: {
              $sum: "$totalTokens",
            },
          },
        },
      ]),

      AIActivity.aggregate([
        {
          $match: {
            userId,
            createdAt: { $gte: monthStart },
          },
        },
        {
          $group: {
            _id: null,
            monthlyRequests: { $sum: 1 },
            monthlyTokens: { $sum: "$totalTokens" },
          },
        },
      ]),

      AIActivity.find({ userId })
        .sort({ createdAt: -1 })
        .limit(6)
        .select("tool language score issueCount bugCount testCaseCount createdAt")
        .lean(),
    ]);

  const stats = overallStats[0] || {};
  const monthly = monthlyStats[0] || {};

  return {
    overview: {
      totalRequests: stats.totalRequests || 0,
      codeReviews: stats.codeReviews || 0,
      codeExplanations: stats.codeExplanations || 0,
      debugSessions: stats.debugSessions || 0,
      testsGenerated: stats.testsGenerated || 0,
      bugsDetected: stats.bugsDetected || 0,
      totalTokens: stats.totalTokens || 0,
    },
    usage: {
      monthlyRequests: monthly.monthlyRequests || 0,
      monthlyTokens: monthly.monthlyTokens || 0,
    },
    recentActivities,
  };
};
