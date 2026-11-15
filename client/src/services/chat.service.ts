import api from "./api";
import type {
  ApiResponse,
  ChatConversation,
  ConversationsResult,
  ConversationMessagesResult,
  SendChatMessagePayload,
  SendChatMessageResult,
  RenameConversationPayload,
  EditChatMessageResult,
  StreamChatMessageResult,
} from "@/types/chat";

export const chatService = {
  // Send message and receive AI response.
  async sendMessage(
    payload: SendChatMessagePayload
  ): Promise<SendChatMessageResult> {
    const response = await api.post<
      ApiResponse<SendChatMessageResult>
    >("/chat/message", payload);

    return response.data.data;
  },

async streamMessage(
  payload: SendChatMessagePayload,
  onChunk: (text: string) => void,
  signal?: AbortSignal
): Promise<StreamChatMessageResult> {
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000/api/v1";

  const response = await fetch(`${baseURL}/chat/stream`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message || "Unable to start chat stream."
    );
  }

  if (!response.body) {
    throw new Error("Streaming response is not available.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let currentEvent = "";
  let finalResult: StreamChatMessageResult | null = null;

  const processLine = (line: string) => {
    if (line.startsWith("event:")) {
      currentEvent = line.slice(6).trim();
      return;
    }

    if (!line.startsWith("data:")) return;

    const rawData = line.slice(5).trim();
    if (!rawData) return;

    const data = JSON.parse(rawData);

    if (currentEvent === "chunk") {
      onChunk(data.text);
    } else if (currentEvent === "done") {
      finalResult = data as StreamChatMessageResult;
    } else if (currentEvent === "error") {
      throw new Error(data.message || "Chat streaming failed.");
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const eventBlock of events) {
        currentEvent = "";

        for (const line of eventBlock.split("\n")) {
          processLine(line);
        }
      }
    }

    buffer += decoder.decode();

    if (buffer.trim()) {
      currentEvent = "";

      for (const line of buffer.split("\n")) {
        processLine(line);
      }
    }
  } finally {
    reader.releaseLock();
  }

  if (!finalResult) {
    throw new Error("Chat stream ended without a completed response.");
  }

  return finalResult;
},

async editMessage(
  conversationId: string,
  messageId: string,
  message: string
): Promise<EditChatMessageResult> {
  const response = await api.patch<
    ApiResponse<EditChatMessageResult>
  >(
    `/chat/conversations/${conversationId}/messages/${messageId}`,
    { message }
  );

  return response.data.data;
},
  // Fetch all conversations for sidebar.
  async getConversations(): Promise<ChatConversation[]> {
    const response = await api.get<
      ApiResponse<ConversationsResult>
    >("/chat/conversations");

    return response.data.data.conversations;
  },

  // Load messages of a conversation.
  async getConversation(
    conversationId: string
  ): Promise<ConversationMessagesResult> {
    const response = await api.get<
      ApiResponse<ConversationMessagesResult>
    >(`/chat/conversations/${conversationId}`);

    return response.data.data;
  },

  // Rename a conversation.
  async renameConversation(
    conversationId: string,
    payload: RenameConversationPayload
  ): Promise<ChatConversation> {
    const response = await api.patch<
      ApiResponse<{ conversation: ChatConversation }>
    >(`/chat/conversations/${conversationId}`, payload);

    return response.data.data.conversation;
  },

  // Delete a conversation.
  async deleteConversation(
    conversationId: string
  ): Promise<void> {
    await api.delete(
      `/chat/conversations/${conversationId}`
    );
  },
};
