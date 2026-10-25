import Transaction from "../schemas/transaction.schema";
import Goal from "../schemas/goal.schema";
import { UserFinancialContext } from "../types/chat.types";

interface TxLike { date: Date | string; type: string; amount: number; category?: string; description?: string }
interface GoalLike { title: string; targetAmount: number; currentAmount?: number; deadline?: Date | string; status?: string }

const toDay = (d: Date | string) => new Date(d).toISOString().split("T")[0];

/**
 * Summary of the user's own data for the AI coach: this calendar month's income,
 * spending by category, the latest transactions and active goals.
 */
export const buildFinancialContext = (
  userId: string,
  transactions: TxLike[],
  goals: GoalLike[],
  now: Date = new Date(),
): UserFinancialContext => {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonth = transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= monthStart && d <= now;
  });

  const income = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  const byCategory = new Map<string, number>();
  for (const t of thisMonth) {
    if (t.type !== "expense") continue;
    const name = t.category || "Other";
    byCategory.set(name, (byCategory.get(name) || 0) + t.amount);
  }
  const topSpendingCategories = [...byCategory.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, amount, percentage: expenses > 0 ? (amount / expenses) * 100 : 0 }));

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((t) => ({
      description: t.description || t.category || "Transaction",
      amount: t.type === "expense" ? -t.amount : t.amount,
      category: t.category || "Other",
      date: toDay(t.date),
    }));

  return {
    userId,
    currency: "LKR ",
    period: `${toDay(monthStart)} to ${toDay(now)} (this month so far)`,
    monthlyIncome: income,
    monthlyExpenses: expenses,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    topSpendingCategories,
    recentTransactions,
    financialGoals: goals
      .filter((g) => g.status !== "Completed")
      .map((g) => ({
        name: g.title,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount || 0,
        deadline: g.deadline ? toDay(g.deadline) : "no deadline",
      })),
  };
};

export const loadFinancialContext = async (userId: string): Promise<UserFinancialContext> => {
  const since = new Date();
  since.setMonth(since.getMonth() - 3);
  const [transactions, goals] = await Promise.all([
    Transaction.find({ userId, date: { $gte: since } }).lean(),
    Goal.find({ userId }).lean(),
  ]);
  return buildFinancialContext(userId, transactions as TxLike[], goals as GoalLike[]);
};
