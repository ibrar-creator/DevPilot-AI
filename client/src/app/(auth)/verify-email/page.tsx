
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Code2, CheckCircle2, XCircle, LoaderCircle } from "lucide-react";
import { authService } from "@/services/auth.service";

type VerificationStatus = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const verify = async () => {
      const token = new URLSearchParams(window.location.search).get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing or invalid.");
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus("success");
        setMessage("Your email has been verified successfully.");
      } catch (error) {
        setStatus("error");

        if (axios.isAxiosError(error)) {
          setMessage(
            error.response?.data?.message ||
              "Email verification failed. Your link may have expired."
          );
        } else {
          setMessage("Something went wrong. Please try again.");
        }
      }
    };

    void verify();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080b12] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#101522] p-8 text-center shadow-2xl">
        <Link
          href="/login"
          className="mb-8 inline-flex items-center gap-2 text-xl font-bold"
        >
          <Code2 className="text-violet-400" size={28} />
          <span>DevPilot AI</span>
        </Link>

        <div className="mb-5 flex justify-center">
          {status === "loading" && (
            <LoaderCircle className="animate-spin text-violet-400" size={54} />
          )}

          {status === "success" && (
            <CheckCircle2 className="text-emerald-400" size={54} />
          )}

          {status === "error" && (
            <XCircle className="text-red-400" size={54} />
          )}
        </div>

        <h1 className="mb-3 text-2xl font-bold">
          {status === "loading"
            ? "Verifying Email"
            : status === "success"
              ? "Email Verified!"
              : "Verification Failed"}
        </h1>

        <p className="mb-7 text-sm leading-6 text-slate-400">{message}</p>

        {status !== "loading" && (
          <Link
            href="/login"
            className="inline-flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold transition hover:bg-violet-500"
          >
            {status === "success" ? "Continue to Login" : "Back to Login"}
          </Link>
        )}
      </div>
    </main>
  );
}
