
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  BookOpen,
  Brain,
  Code2,
  Lightbulb,
  Loader2,
  Play,
  Workflow,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { aiService } from "@/services/ai.service";
import type { CodeExplanation } from "@/types/ai";

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

export default function CodeExplainerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [code, setCode] = useState(starterCode);
  const [language, setLanguage] = useState("javascript");
  const [context, setContext] = useState("");
  const [explanation, setExplanation] =
    useState<CodeExplanation | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleExplain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setExplanation(null);

    if (!code.trim()) {
      setError("Please enter code before requesting an explanation.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await aiService.explainCode({
        code,
        language,
        context: context.trim(),
      });

      setExplanation(result.explanation);
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
          : "Code explanation failed. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
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
            <div className="rounded-xl bg-purple-500/15 p-3 text-purple-400">
              <BookOpen size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                AI Code Explainer
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Understand code, execution flow and programming concepts.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleExplain} className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#101622] p-4 sm:p-6">

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Your source code</h2>

                <p className="mt-1 text-xs text-slate-500">
                  Paste the code you want DevPilot AI to explain.
                </p>
              </div>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-white/10 bg-[#080b12] px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
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
                htmlFor="explanation-context"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Additional context
                <span className="ml-2 text-xs font-normal text-slate-500">
                  Optional
                </span>
              </label>

              <textarea
                id="explanation-context"
                value={context}
                onChange={(event) => setContext(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Tell the AI what you want to understand about this code..."
                className="w-full resize-y rounded-xl border border-white/10 bg-[#080b12] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
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
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Explaining code...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Explain my code
                </>
              )}
            </button>
          </section>
        </form>

        {explanation && (
          <section className="mt-8 space-y-5">

            {/* Overview */}
            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen size={19} className="text-purple-400" />
                <h2 className="text-lg font-semibold">
                  Code overview
                </h2>
              </div>

              <p className="text-sm leading-7 text-slate-300">
                {explanation.overview}
              </p>

              <div className="mt-5 border-t border-white/10 pt-5">
                <h3 className="mb-2 text-sm font-semibold text-purple-300">
                  Purpose of this code
                </h3>

                <p className="text-sm leading-7 text-slate-400">
                  {explanation.purpose}
                </p>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                Programming language: {explanation.language}
              </p>
            </div>

            {/* Line by line */}
            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <Code2 size={19} className="text-blue-400" />

                <h2 className="text-lg font-semibold">
                  Line-by-line explanation
                </h2>
              </div>

              {explanation.lineByLine.length > 0 ? (
                <div className="space-y-4">
                  {explanation.lineByLine.map((item, index) => (
                    <div
                      key={`${item.line}-${index}`}
                      className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4"
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span className="rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400">
                          Line {item.line}
                        </span>
                      </div>

                      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-black/30 p-3 font-mono text-sm text-emerald-300">
                        {item.code}
                      </pre>

                      <p className="mt-3 text-sm leading-7 text-slate-400">
                        {item.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No line-by-line explanation was provided.
                </p>
              )}
            </div>

            {/* Execution Flow */}
            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <Workflow size={19} className="text-cyan-400" />

                <h2 className="text-lg font-semibold">
                  Execution flow
                </h2>
              </div>

              {explanation.executionFlow.length > 0 ? (
                <div className="space-y-3">
                  {explanation.executionFlow.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-[#080b12] p-4"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-xs font-semibold text-cyan-400">
                        {index + 1}
                      </span>

                      <p className="text-sm leading-7 text-slate-300">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No execution flow was provided.
                </p>
              )}
            </div>

            {/* Concepts */}
            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <Brain size={19} className="text-purple-400" />

                <h2 className="text-lg font-semibold">
                  Programming concepts
                </h2>
              </div>

              {explanation.concepts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {explanation.concepts.map((concept, index) => (
                    <div
                      key={`${concept.name}-${index}`}
                      className="rounded-xl border border-white/[0.06] bg-[#080b12] p-4"
                    >
                      <h3 className="mb-2 font-semibold text-purple-300">
                        {concept.name}
                      </h3>

                      <p className="text-sm leading-7 text-slate-400">
                        {concept.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No programming concepts were provided.
                </p>
              )}
            </div>

            {/* Complexity */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Code2 size={18} className="text-emerald-400" />
                  <h2 className="font-semibold">Time complexity</h2>
                </div>

                <p className="text-sm leading-7 text-slate-300">
                  {explanation.timeComplexity}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Brain size={18} className="text-blue-400" />
                  <h2 className="font-semibold">Space complexity</h2>
                </div>

                <p className="text-sm leading-7 text-slate-300">
                  {explanation.spaceComplexity}
                </p>
              </div>
            </div>

            {/* Learning Tips */}
            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <Lightbulb size={19} className="text-yellow-400" />

                <h2 className="text-lg font-semibold">
                  Learning tips
                </h2>
              </div>

              {explanation.learningTips.length > 0 ? (
                <ul className="space-y-3">
                  {explanation.learningTips.map((tip, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm leading-7 text-slate-300"
                    >
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-yellow-400" />
                      {tip}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">
                  No learning tips were provided.
                </p>
              )}
            </div>

          </section>
        )}
      </div>
    </main>
  );
}
