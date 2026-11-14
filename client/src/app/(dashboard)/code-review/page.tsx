
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { ArrowLeft, Copy, Loader2, Play, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { aiService } from "@/services/ai.service";
import type { CodeReview } from "@/types/ai";

const starterCode = `function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }

  return total;
}

console.log(calculateTotal([
  { price: 100 },
  { price: 200 }
]));`;

const languages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "csharp",
  "php",
  "go",
  "rust",
];

export default function CodeReviewPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [code, setCode] = useState(starterCode);
  const [language, setLanguage] = useState("javascript");
  const [context, setContext] = useState("");
  const [review, setReview] = useState<CodeReview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setReview(null);

    if (!code.trim()) {
      setError("Please enter code before starting the review.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await aiService.reviewCode({
        code,
        language,
        context: context.trim(),
      });

      setReview(result.review);
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response !== null &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data !== null &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Code review failed. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyImprovedCode() {
    if (!review?.improvedCode) return;

    try {
      await navigator.clipboard.writeText(review.improvedCode);
    } catch {
      setError("Unable to copy code. Please copy it manually.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-white">
        Checking your session...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-white">
        Redirecting to login...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-7 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/15 p-3 text-blue-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                AI Code Review
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Analyze your code for bugs, security risks and improvements.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleReview} className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#101622] p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Your source code</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Paste the code you want DevPilot AI to review.
                </p>
              </div>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-white/10 bg-[#080b12] px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <Editor
                height="420px"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16 },
                }}
              />
            </div>

            <div className="mt-5">
              <label
                htmlFor="review-context"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Additional context
                <span className="ml-2 text-xs font-normal text-slate-500">
                  Optional
                </span>
              </label>

              <textarea
                id="review-context"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Explain what this code should do or what you want the AI to focus on..."
                className="w-full resize-y rounded-xl border border-white/10 bg-[#080b12] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
              <p className="mt-1 text-right text-xs text-slate-500">
                {context.length}/2000
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Analyzing code...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Review my code
                </>
              )}
            </button>
          </section>
        </form>

        {review && (
          <section className="mt-8 space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
                  <span className="text-3xl font-bold text-blue-400">
                    {review.score}
                  </span>
                  <span className="text-xs text-slate-400">/ 100</span>
                </div>

                <div>
                  <h2 className="text-lg font-semibold">Review summary</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {review.summary}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Language: {review.language}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                <h2 className="mb-4 font-semibold text-emerald-400">
                  Strengths
                </h2>

                {review.strengths.length > 0 ? (
                  <ul className="space-y-3">
                    {review.strengths.map((strength, index) => (
                      <li
                        key={index}
                        className="text-sm leading-6 text-slate-300"
                      >
                        <span className="mr-2 text-emerald-400">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">
                    No strengths were provided.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                <h2 className="mb-4 font-semibold text-orange-400">
                  Issues found ({review.issues.length})
                </h2>

                {review.issues.length > 0 ? (
                  <div className="space-y-4">
                    {review.issues.map((issue, index) => (
                      <div
                        key={index}
                        className="border-b border-white/[0.06] pb-4 last:border-0"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-orange-500/10 px-2 py-1 text-xs text-orange-300">
                            {issue.severity}
                          </span>
                          <span className="text-xs text-slate-500">
                            {issue.category}
                          </span>
                          {issue.line !== null && (
                            <span className="text-xs text-slate-500">
                              Line {issue.line}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-2 text-sm font-semibold">
                          {issue.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {issue.description}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-blue-300">
                          Suggestion: {issue.suggestion}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No issues were reported.
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101622]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
                <div>
                  <h2 className="font-semibold">Improved code</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    AI-suggested version of your code.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyImprovedCode}
                  disabled={!review.improvedCode}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                  <Copy size={14} />
                  Copy code
                </button>
              </div>

              <Editor
                height="350px"
                language={language}
                theme="vs-dark"
                value={review.improvedCode || "// No improved code provided."}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  padding: { top: 16 },
                }}
              />
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
