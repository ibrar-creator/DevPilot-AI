
import { z } from "zod";

export const sendChatMessageSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(10000, "Message cannot exceed 10000 characters"),

    conversationId: z
      .string()
      .regex(/^[a-f\d]{24}$/i, "Invalid conversation ID")
      .optional(),
  })
  .strict();

export const renameConversationSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Conversation title is required")
      .max(100, "Title cannot exceed 100 characters"),
  })
  .strict();
export const editChatMessageSchema = z
  .object({
    message: z
      .string()
      .trim()
      .min(1, "Message is required")
      .max(10000, "Message cannot exceed 10000 characters"),
  })
  .strict();