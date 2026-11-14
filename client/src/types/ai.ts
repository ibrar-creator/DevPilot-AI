
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

export interface CodeDebugPayload {
  code: string;
  language: string;
  errorMessage?: string;
  context?: string;
}

export interface CodeBug {
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  line: number | null;
  description: string;
  rootCause: string;
  fix: string;
}

export interface CodeTestCase {
  input: string;
  expectedOutput: string;
  purpose: string;
}

export interface CodeDebugging {
  language: string;
  summary: string;
  hasBugs: boolean;
  bugs: CodeBug[];
  fixedCode: string;
  changes: string[];
  testCases: CodeTestCase[];
}

export interface CodeDebugResult {
  debugging: CodeDebugging;
  usage: unknown;
  model: string;
}

export interface TestCasePayload {
  code: string;
  language: string;
  framework: "auto" | "jest" | "vitest";
  context?: string;
}

export interface GeneratedTestCase {
  name: string;
  category: "positive" | "negative" | "edge";
  description: string;
  input: string;
  expectedOutput: string;
  testCode: string;
}

export interface TestCaseGeneration {
  framework: "jest" | "vitest";
  summary: string;
  testCases: GeneratedTestCase[];
  testSuiteCode: string;
  setupInstructions: string[];
  coverageNotes: string[];
}

export interface TestCaseGenerationResult {
  testResult: TestCaseGeneration;
  usage: unknown;
  model: string;
}