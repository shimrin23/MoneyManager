import { Router } from "express";
import {
  sendMessage,
  getChatHistory,
  clearSession,
} from "../controllers/chatCoach.controller";

const router = Router();

/**
 * @route   POST /api/coach/chat
 * @desc    Send a message to the AI coach
 * @body    { userId, sessionId?, message, includeFinancialContext?, financialContext? }
 */
router.post("/chat", sendMessage);

/**
 * @route   GET /api/coach/history/:sessionId
 * @desc    Get all messages in a chat session
 */
router.get("/history/:sessionId", getChatHistory);

/**
 * @route   DELETE /api/coach/session/:sessionId
 * @desc    Clear/delete a chat session
 */
router.delete("/session/:sessionId", clearSession);

export default router;
