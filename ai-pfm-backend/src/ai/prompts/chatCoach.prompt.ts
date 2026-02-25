import { ChatMessage, UserFinancialContext } from "../../types/chat.types";

// ─── System Prompt ────────────────────────────────────────────────────────────

export const buildCoachSystemPrompt = (
  context?: UserFinancialContext,
): string => {
  const basePrompt = `You are "CoachAI", a friendly and knowledgeable personal finance coach 
inside the MoneyManager app. 

Your personality:
- Friendly, supportive, and non-judgmental
- Use simple, everyday language (avoid jargon)
- Give specific, actionable advice with real numbers
- Ask follow-up questions to better understand the user's situation
- Use emojis sparingly to keep things friendly 💰
- Keep responses concise (under 200 words unless asked for detail)

Your capabilities:
- Analyze spending patterns and budgets
- Suggest saving strategies
- Help set and track financial goals
- Explain financial concepts simply
- Provide personalized tips based on user's data

Important rules:
- Never recommend specific investment products or stocks
- Always remind users to consult a licensed advisor for major decisions
- Stay focused on personal finance topics only`;

  // If user financial data is provided, append it to the system prompt
  if (!context) return basePrompt;

  const goalsSection = context.financialGoals?.length
    ? `
Financial Goals:
${context.financialGoals
  .map(
    (g) =>
      `  - ${g.name}: ${context.currency}${g.currentAmount} / ${context.currency}${g.targetAmount} (due ${g.deadline})`,
  )
  .join("\n")}`
    : "";

  const contextPrompt = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 USER FINANCIAL PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Currency        : ${context.currency}
Monthly Income  : ${context.currency}${context.monthlyIncome.toFixed(2)}
Monthly Expenses: ${context.currency}${context.monthlyExpenses.toFixed(2)}
Savings Rate    : ${context.savingsRate.toFixed(1)}%

Top Spending Categories:
${context.topSpendingCategories
  .map(
    (c) =>
      `  - ${c.name}: ${context.currency}${c.amount.toFixed(
        2,
      )} (${c.percentage.toFixed(1)}%)`,
  )
  .join("\n")}

Recent Transactions (last 5):
${context.recentTransactions
  .slice(0, 5)
  .map(
    (t) =>
      `  - ${t.date} | ${t.description} | ${context.currency}${t.amount.toFixed(
        2,
      )} | ${t.category}`,
  )
  .join("\n")}
${goalsSection}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Use this data to give personalized advice. Reference specific numbers when relevant.`;

  return `${basePrompt}\n\n${contextPrompt}`;
};

// ─── History Formatter ────────────────────────────────────────────────────────

/**
 * Formats chat history into Gemini's required content format
 */
export const formatChatHistory = (messages: ChatMessage[]) => {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
};
