
"use client";

import {
  MessageSquare,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import type { ChatConversation } from "@/types/chat";

interface ChatSidebarProps {
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  loading: boolean;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, title: string) => void;
  onDeleteConversation: (id: string) => void;
  onClose?: () => void;
}

export default function ChatSidebar({
  conversations,
  selectedConversationId,
  loading,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onClose,
}: ChatSidebarProps) {
  const [search, setSearch] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredConversations = conversations.filter((conversation) =>
    conversation.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleRename = (conversation: ChatConversation) => {
    const title = window.prompt("Enter new conversation title:", conversation.title);

    if (title?.trim() && title.trim() !== conversation.title) {
      onRenameConversation(conversation.id, title.trim());
    }

    setActiveMenu(null);
  };

  const handleDelete = (conversation: ChatConversation) => {
    const confirmed = window.confirm(
      `Delete "${conversation.title}"? This action cannot be undone.`
    );

    if (confirmed) {
      onDeleteConversation(conversation.id);
    }

    setActiveMenu(null);
  };

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-white/10 bg-[#0b0f18]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
            <MessageSquare size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">DevPilot Chat</h2>
            <p className="text-[10px] tracking-wider text-slate-500">
              AI WORKSPACE
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="p-4">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
        >
          <Plus size={17} />
          New Chat
        </button>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3">
          <Search size={15} className="shrink-0 text-slate-500" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search conversations..."
            className="h-10 min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 py-3 text-[10px] font-semibold tracking-[0.16em] text-slate-500">
          CHAT HISTORY
        </p>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-500">
            <Loader2 size={15} className="animate-spin" />
            Loading conversations...
          </div>
        ) : filteredConversations.length === 0 ? (
          <p className="px-2 py-8 text-center text-xs leading-6 text-slate-500">
            {search ? "No matching conversations." : "No conversations yet. Start a new chat!"}
          </p>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const selected =
                selectedConversationId === conversation.id;

              return (
                <div
                  key={conversation.id}
                  className={`group relative flex items-center gap-1 rounded-xl transition ${
                    selected
                      ? "bg-blue-500/10 text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <button
                    onClick={() => onSelectConversation(conversation.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-left"
                  >
                    <MessageSquare
                      size={15}
                      className={`shrink-0 ${
                        selected ? "text-blue-400" : "text-slate-500"
                      }`}
                    />

                    <span className="truncate text-xs font-medium">
                      {conversation.title}
                    </span>
                  </button>

                  <div className="relative pr-2">
                    <button
                      onClick={() =>
                        setActiveMenu(
                          activeMenu === conversation.id
                            ? null
                            : conversation.id
                        )
                      }
                      className="rounded-lg p-2 text-slate-500 opacity-100 transition hover:bg-white/10 hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Conversation options"
                    >
                      <MoreHorizontal size={17} />
                    </button>

                    {activeMenu === conversation.id && (
                      <div className="absolute right-0 top-full z-30 mt-1 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#151b28] p-1 shadow-xl">
                        <button
                          onClick={() => handleRename(conversation)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-slate-300 hover:bg-white/5 hover:text-white"
                        >
                          <Pencil size={14} />
                          Rename
                        </button>

                        <button
                          onClick={() => handleDelete(conversation)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <p className="text-center text-[10px] text-slate-600">
          DevPilot AI · Your Code. Your AI. Your Copilot.
        </p>
      </div>
    </aside>
  );
}
