// ─── Message Types ────────────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  userId: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ─── Request / Response Types ────────────────────────────────────────────────

export interface SendMessageRequest {
  userId: string;
  sessionId?: string; // if continuing existing session
  message: string;
  includeFinancialContext?: boolean; // attach user's financial data
}

export interface SendMessageResponse {
  sessionId: string;
  message: ChatMessage; // AI reply
  tokensUsed?: number;
  model: string;
}

// ─── User Financial Context ──────────────────────────────────────────────────

export interface UserFinancialContext {
  userId: string;
  currency: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  topSpendingCategories: {
    name: string;
    amount: number;
    percentage: number;
  }[];
  recentTransactions: {
    description: string;
    amount: number;
    category: string;
    date: string;
  }[];
  financialGoals?: {
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
  }[];
}
