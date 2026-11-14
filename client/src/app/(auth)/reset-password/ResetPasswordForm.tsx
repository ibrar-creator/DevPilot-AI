
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Code2,
  Eye,
  EyeOff,
  LockKeyhole,
  CheckCircle2,
} from "lucide-react";
import { authService } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setToken(searchParams.get("token") || "");
  }, [searchParams]);

  const validatePassword = () => {
    if (!token) return "Reset token is missing. Please use the email link again.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password.length > 72) return "Password must not exceed 72 characters.";
    if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter.";
    if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter.";
    if (!/[0-9]/.test(password)) return "Password must contain a number.";
    if (password !== confirmPassword) return "Passwords do not match.";

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validatePassword();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message ||
            "Password reset failed. Your link may have expired."
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
          className="mb-9 inline-flex items-center gap-2 text-xl font-bold"
        >
          <Code2 size={28} className="text-violet-400" />
          DevPilot AI
        </Link>

        {success ? (
          <div className="text-center">
            <div className="mb-5 flex justify-center">
              <CheckCircle2 size={58} className="text-emerald-400" />
            </div>

            <h1 className="mb-3 text-2xl font-bold">Password Updated!</h1>

            <p className="mb-7 text-sm leading-6 text-slate-400">
              Your password has been reset successfully. You can now sign in
              using your new password.
            </p>

            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold transition hover:bg-violet-500"
            >
              Continue to Login
            </button>
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

            <h1 className="mb-2 text-3xl font-bold">Reset Password</h1>

            <p className="mb-8 text-sm leading-6 text-slate-400">
              Create a new password for your DevPilot AI account.
            </p>

            {!token ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                Reset token is missing. Please request a new password reset
                email.
                <Link
                  href="/forgot-password"
                  className="mt-3 block font-semibold text-violet-400 hover:text-violet-300"
                >
                  Request a new reset link
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    New Password
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d18] px-4 focus-within:border-violet-500">
                    <LockKeyhole size={18} className="text-slate-500" />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter new password"
                      className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-slate-500 hover:text-white"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Confirm New Password
                  </label>

                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#080d18] px-4 focus-within:border-violet-500">
                    <LockKeyhole size={18} className="text-slate-500" />

                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      placeholder="Confirm new password"
                      className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-slate-600"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      className="text-slate-500 hover:text-white"
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <p className="text-xs leading-5 text-slate-500">
                  Password must contain at least 8 characters, one uppercase
                  letter, one lowercase letter, and one number.
                </p>

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
                  className="w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Updating Password..." : "Reset Password"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
