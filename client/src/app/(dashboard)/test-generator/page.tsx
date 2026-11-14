
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  CheckCircle2,
  Copy,
  FlaskConical,
  Loader2,
  Play,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { aiService } from "@/services/ai.service";
import type { TestCaseGeneration } from "@/types/ai";

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
  if (!Array.isArray(items)) {
    throw new TypeError("Items must be an array");
  }

  return items.reduce((total, item) => {
    return total + item.price;
  }, 0);
}

console.log(
  calculateTotal([
    { price: 10 },
    { price: 20 },
  ])
);`;

type Framework = "auto" | "jest" | "vitest";

export default function TestGeneratorPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [code, setCode] = useState(starterCode);
  const [language, setLanguage] = useState("javascript");
  const [framework, setFramework] = useState<Framework>("auto");
  const [context, setContext] = useState("");

  const [generation, setGeneration] =
    useState<TestCaseGeneration | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copiedItem, setCopiedItem] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!code.trim()) {
      setError("Please enter your source code.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneration(null);

    try {
      const result = await aiService.generateTestCases({
        code,
        language,
        framework,
        context: context.trim(),
      });

      setGeneration(result.testResult);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to generate test cases. Please try again.";

      setError(message);
    } finally {
      setIsGenerating(false);
    }
  }

  async function copyText(value: string, item: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedItem(item);

      window.setTimeout(() => {
        setCopiedItem("");
      }, 2000);
    } catch {
      setError("Unable to copy. Please check browser clipboard permissions.");
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
          type="button"
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>

        <header className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
            <FlaskConical className="text-cyan-400" size={24} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI Test Generator
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
            Generate meaningful positive, negative and edge test cases
            with complete Jest or Vitest test suites.
          </p>
        </header>

        <form onSubmit={handleGenerate} className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#101622]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-semibold">Your source code</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Paste the code you want to generate tests for.
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
                Testing framework
              </label>

              <select
                value={framework}
                onChange={(event) =>
                  setFramework(event.target.value as Framework)
                }
                className="w-full rounded-xl border border-white/10 bg-[#080b12] px-4 py-3 text-sm text-gray-200 outline-none focus:border-purple-500"
              >
                <option value="auto">Auto detect</option>
                <option value="jest">Jest</option>
                <option value="vitest">Vitest</option>
              </select>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Auto selects an appropriate framework based on your
                programming language and context.
              </p>
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
                placeholder="Describe expected behavior, dependencies or testing requirements..."
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
            disabled={isGenerating || !code.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-4 font-semibold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 size={19} className="animate-spin" />
                Generating test cases...
              </>
            ) : (
              <>
                <Play size={18} />
                Generate test cases
                <Sparkles size={17} />
              </>
            )}
          </button>
        </form>

        {generation && (
          <section className="mt-12 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">
                  Generated test results
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  AI-generated testing suggestions for your source code.
                </p>
              </div>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase text-cyan-400">
                {generation.framework}
              </span>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
              <h3 className="mb-3 font-semibold">Summary</h3>
              <p className="text-sm leading-7 text-gray-300">
                {generation.summary}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
              <h3 className="mb-5 font-semibold">
                Individual test cases ({generation.testCases.length})
              </h3>

              {generation.testCases.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No individual test cases were returned.
                </p>
              ) : (
                <div className="space-y-4">
                  {generation.testCases.map((test, index) => (
                    <article
                      key={`${test.name}-${index}`}
                      className="rounded-xl border border-white/10 bg-[#080b12] p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h4 className="font-semibold">
                          {index + 1}. {test.name}
                        </h4>

                        <span className="rounded-md bg-purple-500/10 px-2 py-1 text-xs uppercase text-purple-300">
                          {test.category}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-gray-400">
                        {test.description}
                      </p>

                      <div className="mt-4">
                        <p className="mb-1 text-xs font-semibold text-gray-500">
                          Input / Setup
                        </p>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[#101622] p-3 text-sm text-gray-300">
                          {test.input}
                        </pre>
                      </div>

                      <div className="mt-4">
                        <p className="mb-1 text-xs font-semibold text-green-400">
                          Expected output
                        </p>
                        <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[#101622] p-3 text-sm text-green-300">
                          {test.expectedOutput}
                        </pre>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-xs font-semibold text-purple-400">
                            Individual test code
                          </p>

                          <button
                            type="button"
                            onClick={() =>
                              copyText(test.testCode, `test-${index}`)
                            }
                            className="flex items-center gap-1.5 text-xs text-gray-400 transition hover:text-white"
                          >
                            {copiedItem === `test-${index}` ? (
                              <CheckCircle2 size={14} />
                            ) : (
                              <Copy size={14} />
                            )}
                            {copiedItem === `test-${index}` ? "Copied" : "Copy"}
                          </button>
                        </div>

                        <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-[#101622] p-4 text-sm leading-6 text-cyan-300">
                          <code>{test.testCode}</code>
                        </pre>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#101622]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                <div>
                  <h3 className="font-semibold">Complete test suite</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Full generated {generation.framework} test file.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    copyText(generation.testSuiteCode, "suite")
                  }
                  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5"
                >
                  {copiedItem === "suite" ? (
                    <CheckCircle2 size={15} />
                  ) : (
                    <Copy size={15} />
                  )}
                  {copiedItem === "suite" ? "Copied" : "Copy test suite"}
                </button>
              </div>

              <pre className="overflow-x-auto whitespace-pre-wrap break-words p-5 text-sm leading-7 text-green-300">
                <code>{generation.testSuiteCode}</code>
              </pre>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                <h3 className="mb-4 font-semibold">Setup instructions</h3>

                {generation.setupInstructions.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No setup instructions provided.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {generation.setupInstructions.map((instruction, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm leading-6 text-gray-300"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-1 shrink-0 text-cyan-400"
                        />
                        {instruction}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#101622] p-5">
                <h3 className="mb-4 font-semibold">Coverage notes</h3>

                {generation.coverageNotes.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No additional coverage notes provided.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {generation.coverageNotes.map((note, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm leading-6 text-gray-300"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-1 shrink-0 text-purple-400"
                        />
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <p className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-xs leading-6 text-yellow-300/80">
              These are AI-generated test suggestions. They have not been
              executed automatically. Review the generated code and setup
              instructions before running tests in your project.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
