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

export class ChatCoachService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;
  private readonly maxTokens: number;
  private readonly temperature: number;
  private sessionService: ChatSessionService;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.model = process.env.GEMINI_MODEL || "gemini-1.5-pro";
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

  async sendMessage(
    request: SendMessageRequest,
    financialContext?: UserFinancialContext,
  ): Promise<SendMessageResponse> {
    // 1️⃣ Get or create session
    let session = request.sessionId
      ? this.sessionService.getSession(request.sessionId)
      : null;

    if (!session) {
      session = this.sessionService.createSession(request.userId);
    }

    // 2️⃣ Save user message to session
    this.sessionService.addMessage(session.sessionId, "user", request.message);

    // 3️⃣ Build system prompt (with or without financial context)
    const systemPrompt = buildCoachSystemPrompt(
      request.includeFinancialContext ? financialContext : undefined,
    );

    // 4️⃣ Format chat history for Gemini
    const chatHistory = formatChatHistory(
      session.messages.slice(0, -1), // exclude the latest user message
    );

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

    // 6️⃣ Call Gemini API
    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      const message = error?.error?.message || response.statusText;

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
    const aiMessage = this.sessionService.addMessage(
      session.sessionId,
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

  getChatHistory(sessionId: string) {
    const session = this.sessionService.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);
    return session.messages;
  }

  // ─── Clear Chat ───────────────────────────────────────────────────────────

  clearChat(sessionId: string): void {
    this.sessionService.clearSession(sessionId);
  }
}
