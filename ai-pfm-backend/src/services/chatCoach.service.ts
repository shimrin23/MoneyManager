import {
  SendMessageRequest,
  SendMessageResponse,
  UserFinancialContext,
} from "../types/chat.types";
import {
  buildCoachSystemPrompt,
  formatChatHistory,
} from "../ai/prompts/chatCoach.prompt";
import { ChatSessionService } from "./chatSession.service";
import { loadFinancialContext } from "./coach-context.service";
import dotenv from "dotenv";

dotenv.config();

function isPlaceholderGeminiKey(apiKey: string): boolean {
  const normalizedKey = apiKey.trim().toLowerCase();
  return (
    normalizedKey.length === 0 ||
    normalizedKey.startsWith("your_") ||
    normalizedKey.includes("api_key_here") ||
    normalizedKey.includes("gemini_api_key_here")
  );
}

// Gemini answers 503 when the model is overloaded and 429 when the quota is used up
const BUSY_STATUSES = [429, 503];
const GEMINI_ATTEMPTS = 3;

// Thrown when Gemini is still busy after retrying, so the user can be told to try again shortly
export class CoachBusyError extends Error {}

export class ChatCoachService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private sessionService: ChatSessionService;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
    this.maxTokens = Number(process.env.GEMINI_MAX_TOKENS) || 1024;
    this.temperature = Number(process.env.GEMINI_TEMPERATURE) || 0.7;
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;
    this.sessionService = new ChatSessionService();

    if (isPlaceholderGeminiKey(this.apiKey)) {
      throw new Error(
        "GEMINI_API_KEY is missing or still set to a placeholder. Add a valid Gemini API key to ai-pfm-backend/.env and restart the backend.",
      );
    }
  }

  // ─── Send Message ─────────────────────────────────────────────────────────

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    // 1️⃣ Get the user's own session, or start a new one
    let session = request.sessionId
      ? await this.sessionService.getSession(request.sessionId, request.userId)
      : null;

    if (!session) {
      session = await this.sessionService.createSession(request.userId);
    }

    // 2️⃣ Save user message to session
    await this.sessionService.addMessage(session.sessionId, request.userId, "user", request.message);

    // 3️⃣ Build system prompt with the user's real data (loaded on the server, never taken from the request)
    let financialContext: UserFinancialContext | undefined;
    if (request.includeFinancialContext !== false) {
      try {
        financialContext = await loadFinancialContext(request.userId);
      } catch (error) {
        console.error("Could not load financial context for the coach:", error);
      }
    }
    const systemPrompt = buildCoachSystemPrompt(financialContext);

    // 4️⃣ Format chat history for Gemini
    // `session` was loaded before the new message was saved, so it holds only the earlier turns
    const chatHistory = formatChatHistory(session.messages);

    // 5️⃣ Build Gemini request body
    const requestBody = {
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        ...chatHistory,
        {
          role: "user",
          parts: [{ text: request.message }],
        },
      ],
      generationConfig: {
        temperature: this.temperature,
        maxOutputTokens: this.maxTokens,
        topK: 40,
        topP: 0.95,
      },
    };

    // 6️⃣ Call Gemini API. When the model is overloaded (503) or rate limited (429), try again a few times.
    const callGemini = () =>
      fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

    let response = await callGemini();
    for (let attempt = 1; attempt < GEMINI_ATTEMPTS && BUSY_STATUSES.includes(response.status); attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      response = await callGemini();
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      const message = error?.error?.message || response.statusText;

      if (BUSY_STATUSES.includes(response.status)) {
        throw new CoachBusyError(`Gemini is busy: ${message}`);
      }

      if (
        String(message).includes("API key not valid") ||
        error?.error?.status === "API_KEY_INVALID"
      ) {
        throw new Error(
          "Gemini rejected the API key. Check ai-pfm-backend/.env and set GEMINI_API_KEY to a valid Google Gemini key, then restart the backend.",
        );
      }

      throw new Error(
        `Gemini API Error: ${message}`,
      );
    }

    const result = await response.json();
    const aiText =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response. Please try again.";

    // 7️⃣ Save AI reply to session
    const aiMessage = await this.sessionService.addMessage(
      session.sessionId,
      request.userId,
      "assistant",
      aiText,
    );

    return {
      sessionId: session.sessionId,
      message: aiMessage,
      tokensUsed: result.usageMetadata?.totalTokenCount,
      model: this.model,
    };
  }

  // ─── Get Chat History ─────────────────────────────────────────────────────

  async getChatHistory(sessionId: string, userId: string) {
    const session = await this.sessionService.getSession(sessionId, userId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    return session.messages;
  }

  // The user's latest conversation, so the chat can be restored after a refresh
  async getLatestSession(userId: string) {
    return this.sessionService.getLatestSession(userId);
  }

  // ─── Clear Chat ───────────────────────────────────────────────────────────

  async clearChat(sessionId: string, userId: string): Promise<boolean> {
    return this.sessionService.clearSession(sessionId, userId);
  }
}
