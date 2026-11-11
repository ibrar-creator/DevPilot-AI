
"use client";
import { authService } from "@/services/auth.service";
import axios from "axios";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Command,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (name.trim().length < 2) {
    setError("Name must contain at least 2 characters.");
    return;
  }

  if (password.length < 8 || password.length > 72) {
    setError("Password must contain 8 to 72 characters.");
    return;
  }

  if (!/[a-z]/.test(password)) {
    setError("Password must contain a lowercase letter.");
    return;
  }

  if (!/[A-Z]/.test(password)) {
    setError("Password must contain an uppercase letter.");
    return;
  }

  if (!/[0-9]/.test(password)) {
    setError("Password must contain a number.");
    return;
  }

  setLoading(true);

  try {
    await authService.register({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    setSuccess(
      "Registration successful! Please check your email and verify your account before logging in."
    );

    setName("");
    setEmail("");
    setPassword("");
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } else {
      setError("Something went wrong. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-5 py-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="mb-10 flex items-center justify-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600">
            <Command size={21} />
          </div>
          <span className="text-lg font-bold">
            DevPilot<span className="text-blue-400">.</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-white/[0.09] bg-[#0d121d] p-7 sm:p-9">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Get started for free
            </p>
            <h1 className="text-2xl font-bold">Create your account</h1>
            <p className="mt-2 text-sm text-slate-400">
              Start building with your AI coding copilot.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="mb-2 block text-xs font-medium text-slate-300">
                Full name
              </label>
              <div className="relative">
                <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="name"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-medium text-slate-300">
                Email address
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
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
              <label htmlFor="password" className="mb-2 block text-xs font-medium text-slate-300">
                Password
              </label>
              <div className="relative">
                <LockKeyhole size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-600 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <p className="text-xs leading-5 text-slate-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
{error && (
  <div
    role="alert"
    className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
  >
    {error}
  </div>
)}

{success && (
  <div
    role="status"
    className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400"
  >
    {success}
  </div>
)}<button
  type="submit"
  disabled={loading}
  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
>
  {loading ? "Creating account..." : "Create account"}
  {!loading && <ArrowRight size={16} />}
</button>
          </form>

          <p className="mt-7 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-7 text-center text-xs text-slate-600">
          © 2026 DevPilot AI. All rights reserved.
        </p>
      </motion.div>
    </main>
  );
}
