
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Editor, { DiffEditor } from "@monaco-editor/react";
import {
  ArrowLeft,
  Bug,
  CheckCircle2,
  Copy,
  Download,
  FileCode2,
  Loader2,
  Sparkles,
  WandSparkles,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { aiService } from "@/services/ai.service";
import type { CodeFixing } from "@/types/ai";

const starterCode = `function calculateTotal(items) {
  let total = 0;

  for (let i = 0; i < items.length; i++) {
    total = total - items[i].price;
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

export default function CodeFixerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [code, setCode] = useState(starterCode);
  const [language, setLanguage] = useState("javascript");
  const [errorMessage, setErrorMessage] = useState("");
  const [context, setContext] = useState("");

  const [fixing, setFixing] = useState<CodeFixing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleFixCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setFixing(null);
    setCopied(false);

    if (!code.trim()) {
      setError("Please enter source code before fixing.");
      return;
    }

    try {
      setIsSubmitting(true);

      const result = await aiService.fixCode({
        code,
        language,
        errorMessage: errorMessage.trim(),
        context: context.trim(),
      });

      setFixing(result.fixing);
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
          : "Code fixing failed. Please try again.";

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyFixedCode() {
    if (!fixing?.fixedCode) return;

    try {
      await navigator.clipboard.writeText(fixing.fixedCode);
      setCopied(true);
    } catch {
      setError("Unable to copy code. Please copy it manually.");
    }
  }

  function downloadFixedCode() {
    if (!fixing?.fixedCode) return;

    const extensionMap: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      cpp: "cpp",
      csharp: "cs",
      php: "php",
      go: "go",
      rust: "rs",
    };

    const extension = extensionMap[language] || "txt";

    const blob = new Blob([fixing.fixedCode], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `devpilot-fixed-code.${extension}`;
    link.click();

    URL.revokeObjectURL(url);
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

        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-purple-500/15 p-3 text-purple-400">
              <WandSparkles size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                AI Code Fixer
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Find problems and generate corrected code with AI.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Sparkles size={13} />
              AI Powered
            </span>

            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <FileCode2 size={13} />
              Multiple Languages
            </span>

            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <Bug size={13} />
              Bug Detection
            </span>
          </div>
        </header>

        <form onSubmit={handleFixCode} className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#101622] p-4 sm:p-6">

            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">Original source code</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Paste the code you want DevPilot AI to fix.
                </p>
              </div>

              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value);
                  setFixing(null);
                }}
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
                onChange={(value) => {
                  setCode(value ?? "");
                  setFixing(null);
                }}
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

            <div className="mt-5 grid gap-5 lg:grid-cols-2">

              <div>
                <label
                  htmlFor="fix-error"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Error message
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    Optional
                  </span>
                </label>

                <textarea
                  id="fix-error"
                  value={errorMessage}
                  onChange={(event) => setErrorMessage(event.target.value)}
                  maxLength={5000}
                  rows={4}
                  placeholder="Paste your compiler error, runtime error or bug description..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#080b12] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {errorMessage.length}/5000
                </p>
              </div>

              <div>
                <label
                  htmlFor="fix-context"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Additional context
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    Optional
                  </span>
                </label>

                <textarea
                  id="fix-context"
                  value={context}
                  onChange={(event) => setContext(event.target.value)}
                  maxLength={2000}
                  rows={4}
                  placeholder="Explain what the code should do or what behavior you expect..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-[#080b12] p-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-purple-500"
                />

                <p className="mt-1 text-right text-xs text-slate-500">
                  {context.length}/2000
                </p>
              </div>
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
                  Fixing your code...
                </>
              ) : (
                <>
                  <WandSparkles size={17} />
                  Fix my code
                </>
              )}
            </button>
          </section>
        </form>

        {fixing && (
          <section className="mt-8 space-y-5">

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-500/15 p-3 text-emerald-400">
                  <CheckCircle2 size={23} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    AI analysis completed
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    {fixing.summary}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Language: {fixing.language}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-4 sm:p-6">

              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">Code comparison</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Review the differences before applying any changes.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyFixedCode}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium transition hover:bg-white/10"
                  >
                    <Copy size={14} />
                    {copied ? "Copied!" : "Copy fixed code"}
                  </button>

                  <button
                    type="button"
                    onClick={downloadFixedCode}
                    className="flex items-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-xs font-medium transition hover:bg-purple-500"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-red-500" />
                  Original changes
                </span>

                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                  Fixed changes
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-white/10">
                <DiffEditor
                  height="500px"
                  language={fixing.language}
                  theme="vs-dark"
                  original={fixing.originalCode}
                  modified={fixing.fixedCode}
                  options={{
                    readOnly: true,
                    renderSideBySide: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    wordWrap: "on",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    originalEditable: false,
                    padding: { top: 16 },
                  }}
                />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                <h2 className="mb-4 font-semibold text-emerald-400">
                  Issues fixed ({fixing.issuesFixed.length})
                </h2>

                {fixing.issuesFixed.length > 0 ? (
                  <div className="space-y-4">
                    {fixing.issuesFixed.map((issue, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-white/5 bg-[#080b12] p-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-medium text-white">
                            {issue.title}
                          </h3>

                          <span className="rounded-full bg-orange-500/10 px-2 py-1 text-[10px] uppercase text-orange-400">
                            {issue.severity}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {issue.description}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-emerald-400">
                          Fix: {issue.fix}
                        </p>

                        {issue.line !== null && (
                          <p className="mt-2 text-xs text-slate-500">
                            Line: {issue.line}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">
                    No issues were identified.
                  </p>
                )}
              </div>

              <div className="space-y-5">

                <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                  <h2 className="mb-4 font-semibold text-blue-400">
                    Changes made
                  </h2>

                  {fixing.changes.length > 0 ? (
                    <ul className="space-y-3">
                      {fixing.changes.map((change, index) => (
                        <li
                          key={index}
                          className="flex gap-2 text-sm leading-6 text-slate-300"
                        >
                          <CheckCircle2
                            size={16}
                            className="mt-1 shrink-0 text-blue-400"
                          />
                          {change}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No changes were required.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                  <h2 className="mb-4 flex items-center gap-2 font-semibold text-orange-400">
                    <AlertTriangle size={17} />
                    Warnings
                  </h2>

                  {fixing.warnings.length > 0 ? (
                    <ul className="space-y-3">
                      {fixing.warnings.map((warning, index) => (
                        <li
                          key={index}
                          className="text-sm leading-6 text-slate-400"
                        >
                          {warning}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-slate-500">
                      No additional warnings reported.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 text-sm leading-6 text-orange-200/80">
              Review the generated code before using it. DevPilot AI does not
              execute, test or automatically overwrite your original code.
            </div>

          </section>
        )}
      </div>
    </main>
  );
}
