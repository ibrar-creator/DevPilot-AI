
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  Bug,
  CheckCircle2,
  Copy,
  Loader2,
  Play,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { aiService } from "@/services/ai.service";
import type { CodeDebugging } from "@/types/ai";

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

const starterCode = `function calculateTotal(items) {
  return items.reduce((total, item) => {
    return total + item.price;
  }, 0);
}

console.log(calculateTotal(null));`;

export default function AIDebuggerPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [code, setCode] = useState(starterCode);
  const [language, setLanguage] = useState("javascript");
  const [errorMessage, setErrorMessage] = useState(
    "TypeError: Cannot read properties of null (reading 'reduce')"
  );
  const [context, setContext] = useState("");
  const [debugging, setDebugging] = useState<CodeDebugging | null>(null);
  const [isDebugging, setIsDebugging] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleDebug(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!code.trim()) {
      setError("Please enter your source code.");
      return;
    }

    setIsDebugging(true);
    setError("");
    setDebugging(null);

    try {
      const result = await aiService.debugCode({
        code,
        language,
        errorMessage: errorMessage.trim(),
        context: context.trim(),
      });

      setDebugging(result.debugging);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to debug your code. Please try again.";

      setError(message);
    } finally {
      setIsDebugging(false);
    }
  }

  async function copyCode(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      setError("Unable to copy code. Please check browser permissions.");
    }
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-gray-300">
        <Loader2 className="mr-3 h-5 w-5 animate-spin text-purple-400" />
        Checking your session...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080b12] px-4 py-8 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <header className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
            <Bug className="text-red-400" size={24} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Debugger
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
            Find bugs, understand root causes and get AI-powered code fixes
            with practical test cases.
          </p>
        </header>

        <form onSubmit={handleDebug} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101622]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-semibold">Your source code</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Paste the code you want DevPilot AI to debug.
                </p>
              </div>

              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-lg border border-white/10 bg-[#080b12] px-3 py-2 text-sm text-gray-200 outline-none focus:border-purple-500"
              >
                {languages.map((item) => (
                  <option key={item} value={item}>
                    {item === "cpp"
                      ? "C++"
                      : item === "csharp"
                        ? "C#"
                        : item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <Editor
              height="420px"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 18 },
              }}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
              <label className="mb-3 block text-sm font-semibold">
                Error message
                <span className="ml-2 font-normal text-gray-500">
                  Optional
                </span>
              </label>

              <textarea
                value={errorMessage}
                onChange={(event) => setErrorMessage(event.target.value)}
                rows={4}
                maxLength={5000}
                placeholder="Paste your runtime error or compiler error..."
                className="w-full resize-y rounded-xl border border-white/10 bg-[#080b12] p-4 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-purple-500"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
              <label className="mb-3 block text-sm font-semibold">
                Additional context
                <span className="ml-2 font-normal text-gray-500">
                  Optional
                </span>
              </label>

              <textarea
                value={context}
                onChange={(event) => setContext(event.target.value)}
                rows={4}
                maxLength={2000}
                placeholder="What were you trying to achieve?"
                className="w-full resize-y rounded-xl border border-white/10 bg-[#080b12] p-4 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-purple-500"
              />

              <p className="mt-2 text-right text-xs text-gray-500">
                {context.length}/2000
              </p>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
              <ShieldAlert size={19} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isDebugging || !code.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-4 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isDebugging ? (
              <>
                <Loader2 size={19} className="animate-spin" />
                Debugging your code...
              </>
            ) : (
              <>
                <Play size={18} />
                Debug my code
                <Sparkles size={17} />
              </>
            )}
          </button>
        </form>

        {debugging && (
          <section className="mt-12 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Debugging results</h2>
                <p className="mt-1 text-sm text-gray-400">
                  AI analysis of your submitted code.
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  debugging.hasBugs
                    ? "bg-red-500/10 text-red-400"
                    : "bg-green-500/10 text-green-400"
                }`}
              >
                {debugging.hasBugs ? "Bugs detected" : "No bugs detected"}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
              <h3 className="mb-3 font-semibold">Summary</h3>
              <p className="text-sm leading-7 text-gray-300">
                {debugging.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
              <h3 className="mb-5 font-semibold">
                Detected bugs ({debugging.bugs.length})
              </h3>

              {debugging.bugs.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No specific bugs were identified.
                </p>
              ) : (
                <div className="space-y-4">
                  {debugging.bugs.map((bug, index) => (
                    <article
                      key={`${bug.title}-${index}`}
                      className="rounded-xl border border-white/10 bg-[#080b12] p-5"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <h4 className="font-semibold">{bug.title}</h4>

                        <span className="rounded-md bg-red-500/10 px-2 py-1 text-xs uppercase text-red-400">
                          {bug.severity}
                        </span>

                        {bug.line !== null && (
                          <span className="text-xs text-gray-500">
                            Line {bug.line}
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-sm leading-6 text-gray-300">
                        {bug.description}
                      </p>

                      <div className="mt-4">
                        <p className="mb-1 text-xs font-semibold text-purple-400">
                          Root cause
                        </p>
                        <p className="text-sm leading-6 text-gray-400">
                          {bug.rootCause}
                        </p>
                      </div>

                      <div className="mt-4">
                        <p className="mb-1 text-xs font-semibold text-green-400">
                          Suggested fix
                        </p>
                        <p className="text-sm leading-6 text-gray-400">
                          {bug.fix}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101622]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <h3 className="font-semibold">Fixed code</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    AI-suggested corrected version.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyCode(debugging.fixedCode)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                >
                  <Copy size={15} />
                  Copy code
                </button>
              </div>

              {debugging.fixedCode?.trim() ? (
  <pre className="overflow-x-auto whitespace-pre-wrap break-words p-5 text-sm leading-7 text-green-300">
    <code>{debugging.fixedCode}</code>
  </pre>
) : (
  <p className="p-5 text-sm text-gray-400">
    No fixed code was provided.
  </p>
)}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
              <h3 className="mb-4 font-semibold">Changes made</h3>

              {debugging.changes.length === 0 ? (
                <p className="text-sm text-gray-400">No changes listed.</p>
              ) : (
                <ul className="space-y-3">
                  {debugging.changes.map((change, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-gray-300"
                    >
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0 text-green-400"
                      />
                      {change}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
              <h3 className="mb-5 font-semibold">Suggested test cases</h3>

              {debugging.testCases.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No test cases were generated.
                </p>
              ) : (
                <div className="space-y-4">
                  {debugging.testCases.map((test, index) => (
                    <article
                      key={index}
                      className="rounded-xl border border-white/10 bg-[#080b12] p-4"
                    >
                      <p className="mb-3 text-sm font-semibold text-purple-400">
                        Test case {index + 1}
                      </p>

                      <p className="text-xs text-gray-500">Input</p>
                      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-sm text-gray-300">
                        {test.input}
                      </pre>

                      <p className="mt-3 text-xs text-gray-500">
                        Expected output
                      </p>
                      <pre className="mt-1 overflow-x-auto whitespace-pre-wrap text-sm text-green-400">
                        {test.expectedOutput}
                      </pre>

                      <p className="mt-3 text-sm text-gray-400">
                        {test.purpose}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
