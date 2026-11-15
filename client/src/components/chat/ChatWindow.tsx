
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Menu, MessageSquare, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

import { chatService } from "@/services/chat.service";
import type {
  ChatConversation,
  ChatMessage as ChatMessageType,
} from "@/types/chat";

export default function ChatWindow() {
    const router = useRouter();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [editingMessage, setEditingMessage] =
    useState<ChatMessageType | null>(null);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation history
  const loadConversations = useCallback(async () => {
    try {
      const data = await chatService.getConversations();
      setConversations(data);
    } catch {
      toast.error("Unable to load chat history.");
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  // Automatically scroll when messages or streaming text changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, sending, streamingText]);

  // Start a new chat
  const handleNewChat = () => {
    if (sending) return;

    setSelectedConversationId(null);
    setMessages([]);
    setMobileSidebar(false);
    setEditingMessage(null);
    setStreamingText("");
  };

  // Select an existing conversation
  const handleSelectConversation = async (id: string) => {
    if (sending) return;

    if (id === selectedConversationId) {
      setMobileSidebar(false);
      return;
    }

    setSelectedConversationId(id);
    setMessages([]);
    setLoadingMessages(true);
    setMobileSidebar(false);
    setEditingMessage(null);

    try {
      const result = await chatService.getConversation(id);
      setMessages(result.messages);
    } catch {
      toast.error("Unable to load this conversation.");
      setSelectedConversationId(null);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message with live streaming
  const handleSendMessage = async (message: string) => {
    if (sending || !message.trim()) return;

    const previousConversationId = selectedConversationId;

    const temporaryMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
      createdAt: new Date().toISOString(),
    };

    const controller = new AbortController();

    abortControllerRef.current = controller;

    setMessages((previous) => [...previous, temporaryMessage]);
    setStreamingText("");
    setSending(true);

    try {
      const result = await chatService.streamMessage(
        {
          message,
          ...(previousConversationId
            ? { conversationId: previousConversationId }
            : {}),
        },
        (chunk) => {
          setStreamingText((previous) => previous + chunk);
        },
        controller.signal
      );

      setSelectedConversationId(result.conversation.id);

      setMessages((previous) => [
        ...previous.filter(
          (item) => item.id !== temporaryMessage.id
        ),
        result.userMessage,
        result.message,
      ]);

      setStreamingText("");

      await loadConversations();
    } catch (error) {
      setMessages((previous) =>
        previous.filter(
          (item) => item.id !== temporaryMessage.id
        )
      );

      setStreamingText("");

      if (error instanceof Error && error.name === "AbortError") {
        toast.info("Response generation stopped.");
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to generate AI response."
        );
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      setSending(false);
    }
  };
// Stop AI response generation
const handleStopGeneration = () => {
  abortControllerRef.current?.abort();
};
  // Edit a user message
  const handleEditMessage = (message: ChatMessageType) => {
    if (sending) return;

    setEditingMessage(message);
  };

  // Cancel message editing
  const handleCancelEdit = () => {
    setEditingMessage(null);
  };

  // Save edited message
  const handleSaveEditedMessage = async (message: string) => {
    if (!editingMessage || !selectedConversationId || sending) return;

    setSending(true);

    try {
      const result = await chatService.editMessage(
        selectedConversationId,
        editingMessage.id,
        message
      );

      setMessages((previous) => {
        const targetIndex = previous.findIndex(
          (item) => item.id === editingMessage.id
        );

        if (targetIndex === -1) return previous;

        return [
          ...previous.slice(0, targetIndex),
          result.userMessage,
          result.message,
        ];
      });

      setEditingMessage(null);

      await loadConversations();

      toast.success("Message updated successfully.");
    } catch {
      toast.error("Unable to edit message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Regenerate assistant response
  const handleRegenerateMessage = async (
    assistantMessage: ChatMessageType
  ) => {
    if (!selectedConversationId || sending) return;

    const assistantIndex = messages.findIndex(
      (item) => item.id === assistantMessage.id
    );

    if (assistantIndex <= 0) return;

    const previousUserMessage = messages[assistantIndex - 1];

    if (previousUserMessage.role !== "user") {
      toast.error("Unable to find the original prompt.");
      return;
    }

    setSending(true);

    try {
      const result = await chatService.editMessage(
        selectedConversationId,
        previousUserMessage.id,
        previousUserMessage.content
      );

      setMessages((previous) => {
        const targetIndex = previous.findIndex(
          (item) => item.id === previousUserMessage.id
        );

        if (targetIndex === -1) return previous;

        return [
          ...previous.slice(0, targetIndex),
          result.userMessage,
          result.message,
        ];
      });

      await loadConversations();

      toast.success("Response regenerated successfully.");
    } catch {
      toast.error("Unable to regenerate response. Please try again.");
    } finally {
      setSending(false);
    }
  };

  // Rename conversation
  const handleRenameConversation = async (
    id: string,
    title: string
  ) => {
    try {
      const updated = await chatService.renameConversation(id, { title });

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === id
            ? { ...conversation, ...updated }
            : conversation
        )
      );

      toast.success("Conversation renamed.");
    } catch {
      toast.error("Unable to rename conversation.");
    }
  };

  // Delete conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      await chatService.deleteConversation(id);

      setConversations((previous) =>
        previous.filter((conversation) => conversation.id !== id)
      );

      if (selectedConversationId === id) {
        setSelectedConversationId(null);
        setMessages([]);
        setEditingMessage(null);
      }

      toast.success("Conversation deleted.");
    } catch {
      toast.error("Unable to delete conversation.");
    }
  };

  return (
    <main className="flex h-dvh min-h-[600px] overflow-hidden bg-[#080b12] text-white">
      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <button
          type="button"
          aria-label="Close chat sidebar"
          onClick={() => setMobileSidebar(false)}
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:relative md:translate-x-0 ${
          mobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          selectedConversationId={selectedConversationId}
          loading={loadingHistory}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onRenameConversation={handleRenameConversation}
          onDeleteConversation={handleDeleteConversation}
          onClose={() => setMobileSidebar(false)}
        />
      </div>

      {/* Main chat section */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/10 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
  type="button"
  onClick={() => router.push("/")}
  className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-white"
  aria-label="Back to Dashboard"
>
  <ArrowLeft size={16} />
  <span className="hidden sm:inline">Dashboard</span>
</button>
            <button
              type="button"
              onClick={() => setMobileSidebar(true)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white md:hidden"
              aria-label="Open chat sidebar"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="text-sm font-semibold text-white">
                {selectedConversationId
                  ? conversations.find(
                      (conversation) =>
                        conversation.id === selectedConversationId
                    )?.title || "AI Chat"
                  : "New Chat"}
              </h1>

              <p className="mt-0.5 text-[10px] text-slate-500">
                DevPilot AI Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

            <span className="text-[10px] font-medium text-blue-300">
              AI Ready
            </span>
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && !loadingMessages ? (
            <div className="flex min-h-full flex-col items-center justify-center px-5 py-12 text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Sparkles size={30} />
              </div>

              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                How can I help you today?
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                Ask anything about programming, debugging, software development,
                learning or everyday questions.
              </p>

              <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Explain a concept",
                    prompt:
                      "Explain JavaScript closures with a simple example.",
                  },
                  {
                    title: "Debug my code",
                    prompt:
                      "Help me understand how to debug a JavaScript error.",
                  },
                  {
                    title: "Build a project",
                    prompt:
                      "Help me plan a full-stack application step by step.",
                  },
                  {
                    title: "Review code",
                    prompt:
                      "What makes code clean, readable and maintainable?",
                  },
                ].map((suggestion) => (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => void handleSendMessage(suggestion.prompt)}
                    disabled={sending}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-blue-500/30 hover:bg-blue-500/5 disabled:opacity-50"
                  >
                    <MessageSquare
                      size={16}
                      className="mb-3 text-blue-400"
                    />

                    <p className="text-sm font-semibold text-slate-200">
                      {suggestion.title}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {suggestion.prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto w-full max-w-4xl px-4 py-4">
              {loadingMessages ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  Loading messages...
                </p>
              ) : (
                <>
                  {/* Saved messages */}
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onEdit={handleEditMessage}
                      onRegenerate={handleRegenerateMessage}
                      isLastAssistant={
                        message.role === "assistant" &&
                        index === messages.length - 1 &&
                        !sending
                      }
                    />
                  ))}

                  {/* Live streaming response */}
                  {sending && (
                    streamingText ? (
                      <ChatMessage
                        message={{
                          id: "streaming-assistant",
                          role: "assistant",
                          content: streamingText,
                          createdAt: new Date().toISOString(),
                        }}
                        onEdit={handleEditMessage}
                        onRegenerate={handleRegenerateMessage}
                        isLastAssistant={false}
                      />
                    ) : (
                      <div className="flex items-center gap-3 py-5 text-xs text-slate-400">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-400">
                          <Sparkles
                            size={17}
                            className="animate-pulse"
                          />
                        </div>

                        DevPilot AI is thinking...
                      </div>
                    )
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Chat input */}
        <ChatInput
  onSend={
    editingMessage
      ? handleSaveEditedMessage
      : handleSendMessage
  }
  onStop={handleStopGeneration}
  loading={sending}
  disabled={loadingMessages}
  initialMessage={editingMessage?.content ?? ""}
  isEditing={Boolean(editingMessage)}
  onCancelEdit={handleCancelEdit}
/>
      </section>
    </main>
  );
}
