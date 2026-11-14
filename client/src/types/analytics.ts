
export interface DashboardOverview {
  totalRequests: number;
  codeReviews: number;
  codeExplanations: number;
  debugSessions: number;
  testsGenerated: number;
  bugsDetected: number;
  totalTokens: number;
}

export interface DashboardUsage {
  monthlyRequests: number;
  monthlyTokens: number;
}

export interface RecentActivity {
  _id: string;
  tool:
    | "code-review"
    | "code-explainer"
    | "ai-debugger"
    | "test-generator"
    | "code-fixer";
  language: string;
  score?: number | null;
  issueCount: number;
  bugCount: number;
  testCaseCount: number;
  createdAt: string;
}

export interface DashboardAnalytics {
  overview: DashboardOverview;
  usage: DashboardUsage;
  recentActivities: RecentActivity[];
}
