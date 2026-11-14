"use client";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ArrowRight,
  Command,
  Eye,
  EyeOff,
  Code2,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const loggedInUser = await authService.login({
        email: email.trim(),
        password,
      });

      setUser(loggedInUser);

      router.replace("/");
      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Unable to login. Please try again.",
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen bg-[#080b12] text-white">
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-white/[0.07] p-12 lg:flex">
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />

        <Link href="/" className="relative flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600">
            <Command size={21} />
          </div>
          <span className="text-lg font-bold">
            DevPilot<span className="text-blue-400">.</span>
          </span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative max-w-lg"
        >
          <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-xs text-blue-300">
            <Sparkles size={14} />
            YOUR AI DEVELOPMENT COPILOT
          </div>

          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Build smarter.
            <br />
            <span className="text-blue-400">Ship faster.</span>
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
            Your intelligent coding workspace. Review code, understand complex
            logic, detect bugs and generate tests with AI.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/15 text-blue-400">
                <Sparkles size={19} />
              </div>
              <div>
                <p className="text-sm font-semibold">
                  One workspace. Four AI tools.
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Everything you need to improve your code.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="relative text-xs text-slate-600">
          © 2026 DevPilot AI. Built for developers.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link href="/" className="mb-12 flex items-center gap-3 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600">
              <Command size={19} />
            </div>
            <span className="font-bold">
              DevPilot<span className="text-blue-400">.</span>
            </span>
          </Link>

          <div className="mb-9">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Welcome back
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Enter your details to access your workspace.
            </p>
          </div>

          <button
            type="button"
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] text-sm font-medium transition hover:bg-white/[0.07]"
          >
            <Code2 size={18} />
            Sign in with GitHub
          </button>

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-600">
              OR CONTINUE WITH EMAIL
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-medium text-slate-300"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={17}
                />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-medium text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={17}
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-violet-400 transition hover:text-violet-300"
              >
                Forgot Password?
              </Link>
            </div>
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
              >
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-400 hover:text-blue-300"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </section>
    </main>
  );
}
