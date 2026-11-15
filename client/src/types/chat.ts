export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  title: string;
  lastMessageAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SendChatMessagePayload {
  message: string;
  conversationId?: string;
}

export interface SendChatMessageResult {
  conversation: ChatConversation;
  message: ChatMessage;
  usage: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  model: string;
}

export interface ConversationsResult {
  conversations: ChatConversation[];
}

export interface ConversationMessagesResult {
  conversation: {
    id: string;
    title: string;
  };
  messages: ChatMessage[];
}

export interface RenameConversationPayload {
  title: string;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}
export interface EditChatMessageResult {
  conversation: ChatConversation;
  userMessage: ChatMessage;
  message: ChatMessage;
  usage: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };
  model: string;
}
export interface StreamChatMessageResult {
  conversation: ChatConversation;

  userMessage: ChatMessage;

  message: ChatMessage;

  usage: {
    promptTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
  };

  model: string;
}