import { v4 as uuidv4 } from "uuid";
import { ChatSession, ChatMessage, MessageRole } from "../types/chat.types";

/**
 * In-memory session store (replace with Redis/DB in production)
 */
const sessionStore = new Map<string, ChatSession>();

export class ChatSessionService {
  private maxHistory: number;

  constructor() {
    this.maxHistory = Number(process.env.CHAT_MAX_HISTORY) || 20;
  }

  // ─── Create Session ─────────────────────────────────────────────────────────

  createSession(userId: string): ChatSession {
    const session: ChatSession = {
      sessionId: uuidv4(),
      userId,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sessionStore.set(session.sessionId, session);
    return session;
  }

  // ─── Get Session ────────────────────────────────────────────────────────────

  getSession(sessionId: string): ChatSession | null {
    return sessionStore.get(sessionId) || null;
  }

  // ─── Add Message ────────────────────────────────────────────────────────────

  addMessage(
    sessionId: string,
    role: MessageRole,
    content: string,
  ): ChatMessage {
    const session = this.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const message: ChatMessage = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    session.messages.push(message);
    session.updatedAt = new Date().toISOString();

    // Keep only last N messages to manage token limits
    if (session.messages.length > this.maxHistory) {
      session.messages = session.messages.slice(-this.maxHistory);
    }

    sessionStore.set(sessionId, session);
    return message;
  }

  // ─── Clear Session ───────────────────────────────────────────────────────────

  clearSession(sessionId: string): void {
    sessionStore.delete(sessionId);
  }

  // ─── Get All Sessions for User ───────────────────────────────────────────────

  getUserSessions(userId: string): ChatSession[] {
    return Array.from(sessionStore.values()).filter((s) => s.userId === userId);
  }
}
