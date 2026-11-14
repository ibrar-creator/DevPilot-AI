
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface AuthResponse {
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface CodeReviewPayload {
  code: string;
  language: string;
  context?: string;
}

export interface CodeReviewIssue {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category:
    | "bug"
    | "security"
    | "performance"
    | "quality"
    | "maintainability";
  title: string;
  description: string;
  line: number | null;
  suggestion: string;
}

export interface CodeReview {
  language: string;
  summary: string;
  score: number;
  strengths: string[];
  issues: CodeReviewIssue[];
  improvedCode: string;
}

export interface CodeReviewResult {
  review: CodeReview;
  usage: unknown;
  model: string;
}
export interface CodeExplanationPayload {
  code: string;
  language: string;
  context?: string;
}

export interface CodeExplanationLine {
  line: number;
  code: string;
  explanation: string;
}

export interface CodeConcept {
  name: string;
  explanation: string;
}

export interface CodeExplanation {
  language: string;
  overview: string;
  purpose: string;
  lineByLine: CodeExplanationLine[];
  executionFlow: string[];
  concepts: CodeConcept[];
  timeComplexity: string;
  spaceComplexity: string;
  learningTips: string[];
}

export interface CodeExplanationResult {
  explanation: CodeExplanation;
  usage: unknown;
  model: string;
}