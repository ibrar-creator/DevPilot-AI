
"use client";

import { useState } from "react";
import {
  Bot,
  User,
  Copy,
  Share2,
  Pencil,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
} from "lucide-react";

import type { ChatMessage as ChatMessageType } from "@/types/chat";
import MessageContent from "./MessageContent";

interface ChatMessageProps {
  message: ChatMessageType;
  onEdit?: (message: ChatMessageType) => void;
  onRegenerate?: (message: ChatMessageType) => void;
  isLastAssistant?: boolean;
}

export default function ChatMessage({
  message,
  onEdit,
  onRegenerate,
  isLastAssistant = false,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [listening, setListening] = useState(false);

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const shareMessage = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: isUser ? "DevPilot AI Prompt" : "DevPilot AI Response",
          text: message.content,
        });
      } else {
        await navigator.clipboard.writeText(message.content);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Sharing failed:", error);
      }
    }
  };

  const toggleListen = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (listening) {
      window.speechSynthesis.cancel();
      setListening(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.onend = () => setListening(false);
    utterance.onerror = () => setListening(false);

    setListening(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <article
      className={`group flex w-full gap-3 py-5 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
          <Bot size={19} />
        </div>
      )}

      <div
        className={`min-w-0 ${
          isUser
            ? "max-w-[85%] rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3"
            : "flex-1 pt-1"
        }`}
      >
        {!isUser && (
          <div className="mb-2 text-xs font-semibold text-white">
            DevPilot AI
          </div>
        )}

        <MessageContent content={message.content} />

        <div
          className={`mt-2 flex flex-wrap items-center gap-1 transition-opacity ${
            isUser
              ? "justify-end opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
              : "justify-start opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          }`}
        >
          <button
            type="button"
            onClick={() => void copyMessage()}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-500 hover:bg-white/10 hover:text-white"
            aria-label={isUser ? "Copy prompt" : "Copy response"}
            title={isUser ? "Copy prompt" : "Copy response"}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>

          <button
            type="button"
            onClick={() => void shareMessage()}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-500 hover:bg-white/10 hover:text-white"
            aria-label={isUser ? "Share prompt" : "Share response"}
            title={isUser ? "Share prompt" : "Share response"}
          >
            <Share2 size={13} />
            Share
          </button>

          {isUser ? (
            <button
              type="button"
              onClick={() => onEdit?.(message)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-500 hover:bg-white/10 hover:text-white"
              aria-label="Edit message"
              title="Edit message"
            >
              <Pencil size={13} />
              Edit
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleListen}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-500 hover:bg-white/10 hover:text-white"
                aria-label={listening ? "Stop listening" : "Listen to response"}
                title={listening ? "Stop listening" : "Listen"}
              >
                {listening ? <VolumeX size={13} /> : <Volume2 size={13} />}
                {listening ? "Stop" : "Listen"}
              </button>

              {isLastAssistant && (
                <button
                  type="button"
                  onClick={() => onRegenerate?.(message)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-slate-500 hover:bg-white/10 hover:text-white"
                  aria-label="Regenerate response"
                  title="Regenerate response"
                >
                  <RotateCcw size={13} />
                  Regenerate
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-700 text-slate-200">
          <User size={18} />
        </div>
      )}
    </article>
  );
}
