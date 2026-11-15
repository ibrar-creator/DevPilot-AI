
"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import {
  ArrowUp,
  Loader2,
  Paperclip,
  X,
  Pencil,
  Square,
} from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  loading: boolean;
  disabled?: boolean;
  initialMessage?: string;
  isEditing?: boolean;
  onCancelEdit?: () => void;
}

export default function ChatInput({
  onSend,
  onStop,
  loading,
  disabled = false,
  initialMessage = "",
  isEditing = false,
  onCancelEdit,
}: ChatInputProps) {
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage(initialMessage);
  }, [initialMessage]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading || disabled) return;

    onSend(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape" && isEditing) {
      onCancelEdit?.();
      setMessage("");
      return;
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const cancelEdit = () => {
    setMessage("");
    onCancelEdit?.();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-4 pt-2">
      {isEditing && (
        <div className="mb-2 flex items-center justify-between rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-blue-300">
            <Pencil size={14} />
            Editing your message
          </div>

          <button
            type="button"
            onClick={cancelEdit}
            disabled={loading}
            className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white disabled:opacity-50"
            aria-label="Cancel editing"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/10 bg-[#111722] p-3 shadow-lg transition focus-within:border-blue-500/40"
      >
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message DevPilot AI..."
          disabled={disabled || loading}
          rows={2}
          maxLength={10000}
          className="max-h-48 min-h-[56px] w-full resize-y bg-transparent px-2 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-500 disabled:cursor-not-allowed"
        />

        <div className="flex items-center justify-between px-1 pt-2">
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <Paperclip size={14} />
            <span>Shift + Enter for a new line</span>
          </div>

          {loading && !isEditing ? (
            <button
              type="button"
              onClick={onStop}
              disabled={!onStop}
              aria-label="Stop generating response"
              title="Stop generating"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500 text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Square size={15} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!message.trim() || loading || disabled}
              aria-label={isEditing ? "Save edited message" : "Send message"}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-500"
            >
              {loading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <ArrowUp size={19} />
              )}
            </button>
          )}
        </div>
      </form>

      <p className="mt-3 text-center text-[10px] text-slate-600">
        DevPilot AI can make mistakes. Verify important information and code.
      </p>
    </div>
  );
}
