import { Request, Response } from "express";
import { ChatCoachService } from "../services/chatCoach.service";
import { SendMessageRequest, UserFinancialContext } from "../types/chat.types";

const chatCoachService = new ChatCoachService();

// ─── POST /api/coach/chat ─────────────────────────────────────────────────────

export const sendMessage = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      userId,
      sessionId,
      message,
      includeFinancialContext,
      financialContext,
    }: SendMessageRequest & { financialContext?: UserFinancialContext } =
      req.body;

    // ── Validation ────────────────────────────────────────────────
    if (!userId || !message) {
      res.status(400).json({
        success: false,
        error: "userId and message are required",
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
    const result = await chatCoachService.sendMessage(
      { userId, sessionId, message, includeFinancialContext },
      financialContext,
    );

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

// ─── GET /api/coach/history/:sessionId ───────────────────────────────────────

export const getChatHistory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const messages = chatCoachService.getChatHistory(sessionId);

    res.status(200).json({
      success: true,
      data: { sessionId, messages, total: messages.length },
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};

// ─── DELETE /api/coach/session/:sessionId ────────────────────────────────────

export const clearSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    chatCoachService.clearChat(sessionId);

    res.status(200).json({
      success: true,
      message: `Session ${sessionId} cleared successfully`,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
