// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  transactionCount: number;
  trend: "up" | "down" | "stable"; // compared to last period
}

export interface SpendingData {
  userId: string;
  currency: string;
  period: {
    startDate: string;
    endDate: string;
    label: string; // e.g. "January 2026"
  };
  totalIncome: number;
  totalExpenses: number;
  categories: SpendingCategory[];
  previousPeriodExpenses?: number; // for trend comparison
}

export interface PromptTemplate {
  systemPrompt: string;
  userPrompt: string;
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are MoneyManager AI, an expert personal finance advisor.
Your job is to analyze a user's spending data and provide smart, friendly, 
and actionable financial advice.

Rules:
- Be encouraging, not judgmental
- Use simple, clear language
- Give specific numbers and percentages in your insights
- Keep recommendations realistic and achievable
- Structure your response with clear headings
- Always end with a motivational closing line`;

// ─── Prompt Builders ─────────────────────────────────────────────────────────

/**
 * Builds the full spending analysis prompt for Gemini
 */
export const buildSpendingAnalysisPrompt = (
  data: SpendingData,
): PromptTemplate => {
  const netSavings = data.totalIncome - data.totalExpenses;
  const savingsRate = ((netSavings / data.totalIncome) * 100).toFixed(1);
  const isOverspending = netSavings < 0;

  // Compare with previous period if available
  const periodComparison = data.previousPeriodExpenses
    ? `- vs Last Period: ${data.currency}${data.previousPeriodExpenses.toFixed(
        2,
      )} (${
        data.totalExpenses > data.previousPeriodExpenses
          ? "▲ increased"
          : "▼ decreased"
      } by ${Math.abs(
        ((data.totalExpenses - data.previousPeriodExpenses) /
          data.previousPeriodExpenses) *
          100,
      ).toFixed(1)}%)`
    : "";

  // Build category breakdown table
  const categoryTable = data.categories
    .sort((a, b) => b.amount - a.amount)
    .map(
      (cat, index) =>
        `  ${index + 1}. ${cat.name}
     Amount    : ${data.currency}${cat.amount.toFixed(2)}
     % of spend: ${cat.percentage.toFixed(1)}%
     Trend     : ${
       cat.trend === "up"
         ? "📈 Increasing"
         : cat.trend === "down"
         ? "📉 Decreasing"
         : "➡️ Stable"
     }
     Transactions: ${cat.transactionCount}`,
    )
    .join("\n\n");

  const userPrompt = `
Analyze the spending data below for ${
    data.period.label
  } and provide a full financial report.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SPENDING SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Period        : ${data.period.startDate} → ${data.period.endDate}
Total Income  : ${data.currency}${data.totalIncome.toFixed(2)}
Total Expenses: ${data.currency}${data.totalExpenses.toFixed(2)}
Net Savings   : ${data.currency}${netSavings.toFixed(2)} ${
    isOverspending ? "⚠️ OVERSPENDING" : "✅"
  }
Savings Rate  : ${savingsRate}%
${periodComparison}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗂️ SPENDING BY CATEGORY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${categoryTable}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 REQUIRED OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Please respond with exactly these sections:

## 💰 Financial Health Score
Rate from 1–10 with a one-line reason.

## 📌 Key Insights
3 bullet points highlighting the most important spending observations.

## ⚠️ Areas of Concern
List any overspending categories or risky patterns. Say "None" if all looks good.

## ✅ What You're Doing Well
1–2 positive financial habits observed.

## 🎯 Action Plan for Next Month
3–5 specific, numbered recommendations with target amounts.

## 💡 Smart Saving Tip
One personalized tip based on the biggest spending category.
`;

  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
  };
};

/**
 * Builds a short quick-summary prompt (for dashboard widgets)
 */
export const buildQuickSummaryPrompt = (data: SpendingData): string => {
  const savingsRate = (
    ((data.totalIncome - data.totalExpenses) / data.totalIncome) *
    100
  ).toFixed(1);

  return `
In exactly 2 sentences, summarize this user's financial month:
- Income: ${data.currency}${data.totalIncome.toFixed(2)}
- Expenses: ${data.currency}${data.totalExpenses.toFixed(2)}
- Savings Rate: ${savingsRate}%
- Biggest spend: ${
    data.categories[0]?.name
  } (${data.categories[0]?.percentage.toFixed(1)}%)
Be friendly and use simple language.`;
};

/**
 * Builds a category-specific deep-dive prompt
 */
export const buildCategoryDeepDivePrompt = (
  category: SpendingCategory,
  data: SpendingData,
): string => {
  return `
The user spent ${data.currency}${category.amount.toFixed(2)} on "${
    category.name
  }" 
in ${data.period.label}, which is ${category.percentage.toFixed(
    1,
  )}% of their total expenses.
This category is trending ${category.trend}.

Provide:
1. Is this amount reasonable? (compare to general guidelines)
2. Two specific ways to reduce spending in this category
3. A realistic monthly budget target for "${category.name}"
Keep it under 150 words.`;
};
