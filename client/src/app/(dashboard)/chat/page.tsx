
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import ChatWindow from "@/components/chat/ChatWindow";

export default function ChatPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080b12] text-white">
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          Loading DevPilot Chat...
        </div>
      </main>
    );
  }

  return <ChatWindow />;
}
