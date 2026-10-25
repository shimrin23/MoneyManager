import { randomUUID } from "crypto";
import ChatSessionModel from "../schemas/chat_session.schema";
import { ChatSession, ChatMessage, MessageRole } from "../types/chat.types";

/**
 * Chat sessions are stored in MongoDB, so a conversation is still there after a page
 * refresh or a server restart. Every lookup is limited to the session's owner.
 */
export class ChatSessionService {
  private maxHistory: number;

  constructor() {
    this.maxHistory = Number(process.env.CHAT_MAX_HISTORY) || 20;
  }

  private toSession(doc: any): ChatSession {
    return {
      sessionId: doc.sessionId,
      userId: doc.userId,
      messages: (doc.messages || []).map((m: ChatMessage) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
      createdAt: new Date(doc.createdAt).toISOString(),
      updatedAt: new Date(doc.updatedAt).toISOString(),
    };
  }

  // ─── Create Session ─────────────────────────────────────────────────────────

  async createSession(userId: string): Promise<ChatSession> {
    const doc = await ChatSessionModel.create({
      sessionId: randomUUID(),
      userId,
      messages: [],
    });
    return this.toSession(doc);
  }

  // ─── Get Session (only the owner's) ─────────────────────────────────────────

  async getSession(sessionId: string, userId: string): Promise<ChatSession | null> {
    const doc = await ChatSessionModel.findOne({ sessionId, userId }).lean();
    return doc ? this.toSession(doc) : null;
  }

  // The user's most recent conversation, used to restore the chat when it is opened
  async getLatestSession(userId: string): Promise<ChatSession | null> {
    const doc = await ChatSessionModel.findOne({ userId }).sort({ updatedAt: -1 }).lean();
    return doc ? this.toSession(doc) : null;
  }

  // ─── Add Message ────────────────────────────────────────────────────────────

  async addMessage(
    sessionId: string,
    userId: string,
    role: MessageRole,
    content: string,
  ): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: randomUUID(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };

    // Keep only last N messages to manage token limits
    const updated = await ChatSessionModel.findOneAndUpdate(
      { sessionId, userId },
      { $push: { messages: { $each: [message], $slice: -this.maxHistory } } },
      { new: true },
    );
    if (!updated) throw new Error(`Session ${sessionId} not found`);
    return message;
  }

  // ─── Clear Session ───────────────────────────────────────────────────────────

  async clearSession(sessionId: string, userId: string): Promise<boolean> {
    const result = await ChatSessionModel.deleteOne({ sessionId, userId });
    return result.deletedCount > 0;
  }

  // ─── Get All Sessions for User ───────────────────────────────────────────────

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    const docs = await ChatSessionModel.find({ userId }).sort({ updatedAt: -1 }).lean();
    return docs.map((d) => this.toSession(d));
  }
}
