import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import {
  sendMessage,
  getChatHistory,
  getLatestSession,
  clearSession,
} from "../controllers/chatCoach.controller";

const router = Router();

// Every coach route needs a logged-in user; the user id comes from the token
router.use(authenticateToken);

/**
 * @route   POST /api/coach/chat
 * @desc    Send a message to the AI coach (uses the logged-in user's own data)
 * @body    { sessionId?, message, includeFinancialContext? }
 */
router.post("/chat", sendMessage);

/**
 * @route   GET /api/coach/session/latest
 * @desc    The user's most recent conversation, to restore the chat after a refresh
 */
router.get("/session/latest", getLatestSession);

/**
 * @route   GET /api/coach/history/:sessionId
 * @desc    Get all messages in one of the user's chat sessions
 */
router.get("/history/:sessionId", getChatHistory);

/**
 * @route   DELETE /api/coach/session/:sessionId
 * @desc    Clear/delete one of the user's chat sessions
 */
router.delete("/session/:sessionId", clearSession);

export default router;
