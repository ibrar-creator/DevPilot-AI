import {
  sendChatMessage,
  editChatMessage,
  streamChatMessage,
} from "../services/chat.service.js";
import Conversation from "../models/ai/conversation.model.js";
import ChatMessage from "../models/ai/chat-message.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const sendMessage = asyncHandler(async (req, res) => {
  const result = await sendChatMessage({
    userId: req.user._id,
    ...req.validatedBody,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Message sent successfully", result));
});

export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({
    userId: req.user._id,
  })
    .sort({ lastMessageAt: -1 })
    .select("title lastMessageAt createdAt updatedAt")
    .lean();

  const formattedConversations = conversations.map((conversation) => ({
    id: conversation._id.toString(),
    title: conversation.title,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  }));

  return res.status(200).json(
    new ApiResponse(200, "Conversations fetched successfully", {
      conversations: formattedConversations,
    })
  );
});
export const getConversationMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;

  if (!/^[a-f\d]{24}$/i.test(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
  }

  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: req.user._id,
  }).lean();

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const messages = await ChatMessage.find({
    conversationId: conversation._id,
    userId: req.user._id,
  })
    .sort({ createdAt: 1 })
    .select("role content createdAt")
    .lean();
const formattedMessages = messages.map((message) => ({
  id: message._id.toString(),
  role: message.role,
  content: message.content,
  createdAt: message.createdAt,
}));
  return res.status(200).json(
    new ApiResponse(200, "Chat messages fetched successfully", {
      conversation: {
        id: conversation._id,
        title: conversation.title,
      },
     messages: formattedMessages,
    })
  );
});

export const renameConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOneAndUpdate(
    {
      _id: req.params.conversationId,
      userId: req.user._id,
    },
    {
      $set: { title: req.validatedBody.title },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("title lastMessageAt createdAt updatedAt");

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const formattedConversation = {
    id: conversation._id.toString(),
    title: conversation.title,
    lastMessageAt: conversation.lastMessageAt,
    createdAt: conversation.createdAt,
    updatedAt: conversation.updatedAt,
  };

  return res.status(200).json(
    new ApiResponse(200, "Conversation renamed successfully", {
      conversation: formattedConversation,
    })
  );
});
export const deleteConversation = asyncHandler(async (req, res) => {
  const conversation = await Conversation.findOneAndDelete({
    _id: req.params.conversationId,
    userId: req.user._id,
  });

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  await ChatMessage.deleteMany({
    conversationId: conversation._id,
    userId: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(200, "Conversation deleted successfully")
  );
});
export const editMessage = asyncHandler(async (req, res) => {
  const result = await editChatMessage({
    userId: req.user._id,
    conversationId: req.params.conversationId,
    messageId: req.params.messageId,
    message: req.validatedBody.message,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Message edited successfully", result));
});
export const streamMessage = asyncHandler(async (req, res) => {
  const { message, conversationId } = req.validatedBody;

  const abortController = new AbortController();

  let streamCompleted = false;

res.on("close", () => {
  if (!streamCompleted) {
    abortController.abort();
  }
});

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  res.flushHeaders();

  const sendEvent = (event, data) => {
    if (res.writableEnded || res.destroyed) return;

    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await streamChatMessage({
      userId: req.user._id,
      conversationId,
      message,
      signal: abortController.signal,

      onChunk: (chunk) => {
        sendEvent("chunk", { text: chunk });
      },
    });

    if (!abortController.signal.aborted) {
      sendEvent("done", result);
    }
  } catch (error) {
    if (!abortController.signal.aborted) {
      sendEvent("error", {
        message: error.message || "Streaming failed",
        statusCode: error.statusCode || 500,
      });
    }
  } finally {
    streamCompleted = true;

    if (!res.writableEnded) {
      res.end();
    }
  }
});