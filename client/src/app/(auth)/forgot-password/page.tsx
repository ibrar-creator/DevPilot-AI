
"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import axios from "axios";
import { ArrowLeft, Code2, Mail, Send, CheckCircle2 } from "lucide-react";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(normalizedEmail);
      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Unable to process your request. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101522] p-7 shadow-2xl sm:p-9">
        <Link
          href="/login"
          className="mb-10 inline-flex items-center gap-2 text-xl font-bold"
        >
          <Code2 size={28} className="text-violet-400" />
          DevPilot AI
        </Link>

        {success ? (
          <div className="text-center">
            <div className="mb-5 flex justify-center">
              <CheckCircle2 size={58} className="text-emerald-400" />
            </div>

            <h1 className="mb-3 text-2xl font-bold">Check Your Email</h1>

            <p className="mb-7 text-sm leading-6 text-slate-400">
              If an eligible account exists, a password reset email will be
              sent. Check your inbox and follow the reset link.
            </p>

            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="mb-7 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>

            <h1 className="mb-2 text-3xl font-bold">Forgot Password?</h1>

            <p className="mb-8 text-sm leading-6 text-slate-400">
              Enter your registered email address. We&apos;ll send you a link
              to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email Address
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d18] px-4 focus-within:border-violet-500">
                  <Mail size={18} className="text-slate-500" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                  />
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={17} />
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
