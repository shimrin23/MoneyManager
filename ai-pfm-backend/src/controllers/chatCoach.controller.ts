import { Response } from "express";
import { AuthRequest } from "../middlewares/authMiddleware";
import { ChatCoachService } from "../services/chatCoach.service";

const chatCoachService = new ChatCoachService();

// ─── POST /api/coach/chat ─────────────────────────────────────────────────────

export const sendMessage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // The user always comes from the login token, never from the request body
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const { sessionId, message, includeFinancialContext } = req.body;

    // ── Validation ────────────────────────────────────────────────
    if (typeof message !== "string" || !message) {
      res.status(400).json({
        success: false,
        error: "message is required",
      });
      return;
    }

    if (message.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: "Message cannot be empty",
      });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({
        success: false,
        error: "Message exceeds maximum length of 2000 characters",
      });
      return;
    }

    // ── Call Service ──────────────────────────────────────────────
    const result = await chatCoachService.sendMessage({
      userId,
      sessionId: typeof sessionId === "string" ? sessionId : undefined,
      message,
      includeFinancialContext: includeFinancialContext !== false,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("❌ Chat Coach Error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to process your message. Please try again.",
    });
  }
};

// ─── GET /api/coach/session/latest ───────────────────────────────────────────

export const getLatestSession = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const session = await chatCoachService.getLatestSession(userId);
    res.status(200).json({
      success: true,
      data: session
        ? { sessionId: session.sessionId, messages: session.messages }
        : { sessionId: null, messages: [] },
    });
  } catch (error: any) {
    console.error("❌ Chat history error:", error.message);
    res.status(500).json({ success: false, error: "Failed to load chat history" });
  }
};

// ─── GET /api/coach/history/:sessionId ───────────────────────────────────────

export const getChatHistory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const { sessionId } = req.params;
    const messages = await chatCoachService.getChatHistory(sessionId as string, userId);

    res.status(200).json({
      success: true,
      data: { sessionId, messages, total: messages.length },
    });
  } catch {
    // Same answer whether the session doesn't exist or belongs to someone else
    res.status(404).json({
      success: false,
      error: "Chat session not found",
    });
  }
};

// ─── DELETE /api/coach/session/:sessionId ────────────────────────────────────

export const clearSession = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, error: "User not authenticated" });
      return;
    }

    const { sessionId } = req.params;
    const deleted = await chatCoachService.clearChat(sessionId as string, userId);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Chat session not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Chat cleared",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
