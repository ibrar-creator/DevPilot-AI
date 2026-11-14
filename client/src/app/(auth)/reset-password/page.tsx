
import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-white">
          <p className="text-sm text-slate-400">
            Loading reset password page...
          </p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
