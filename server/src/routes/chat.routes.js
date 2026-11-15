
import { Router } from "express";

import { authenticate } from "../middlewares/authenticate.middleware.js";
import { requirePermission } from "../middlewares/authorize.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { aiRateLimit } from "../middlewares/ai-rate-limit.middleware.js";

import {
  sendChatMessageSchema,
  renameConversationSchema,
  editChatMessageSchema
} from "../validations/chat.validation.js";

import {
  sendMessage,
  streamMessage,
  editMessage,
  getConversations,
  getConversationMessages,
  renameConversation,
  deleteConversation,
} from "../controllers/chat.controller.js";

const router = Router();

router.use(authenticate);
router.use(requirePermission("ai:chat"));

router.get("/conversations", getConversations);

router.post(
  "/message",
  aiRateLimit,
  validate(sendChatMessageSchema),
  sendMessage
);
router.post(
  "/stream",
  aiRateLimit,
  validate(sendChatMessageSchema),
  streamMessage
);
router.patch(
  "/conversations/:conversationId/messages/:messageId",
  aiRateLimit,
  validate(editChatMessageSchema),
  editMessage
);
router.get(
  "/conversations/:conversationId",
  getConversationMessages
);

router.patch(
  "/conversations/:conversationId",
  validate(renameConversationSchema),
  renameConversation
);

router.delete(
  "/conversations/:conversationId",
  deleteConversation
);

export default router;
