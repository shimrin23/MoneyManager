// Financial health calculations shared by the health service, recommendations and tests.
// No database code here, so every rule can be unit tested.

const DAY_MS = 1000 * 60 * 60 * 24;

// Metrics look at this many days before today
export const HEALTH_WINDOW_DAYS = 30;

export const DISCRETIONARY_CATEGORIES = ['Food & Dining', 'Shopping', 'Entertainment', 'Travel', 'Personal Care'];

export interface HealthMetrics {
    totalIncome: number;
    totalExpenses: number;
    savings: number;
    savingsRate: number;
    totalDebt: number;
    debtToIncomeRatio: number;
    creditUtilization: number;
    emergencyFund: number;
    emergencyFundMonths: number;
    liquidityRatio: number;
    netWorth: number;
    discretionaryRatio: number;
}

// Why a score can't be given yet
export type NoDataReason = 'no-transactions' | 'no-income';

interface TxLike { date: Date | string; type: string; amount: number; category?: string }
interface LoanLike { remainingAmount?: number; monthlyInstallment?: number }
interface CardLike { creditLimit?: number; currentBalance?: number }
interface GoalLike { title?: string; category?: string; currentAmount?: number; targetAmount?: number; status?: string }

export const windowStart = (now: Date) => new Date(now.getTime() - HEALTH_WINDOW_DAYS * DAY_MS);

// Goals the user is saving for emergencies (e.g. the "Emergency Fund" goal a recommendation creates)
export const isEmergencyGoal = (goal: GoalLike) =>
    /emergency/i.test(`${goal.title || ''} ${goal.category || ''}`);

export const calculateFinancialMetrics = (
    transactions: TxLike[],
    loans: LoanLike[],
    creditCards: CardLike[],
    monthlyIncomeBaseline: number,
    goals: GoalLike[],
    now: Date = new Date()
): { metrics: HealthMetrics; noDataReason: NoDataReason | null } => {
    const since = windowStart(now);
    const recent = transactions.filter(t => {
        const d = new Date(t.date);
        return d >= since && d <= now;
    });

    const transactionIncome = recent.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    // Profile income is only a fallback when no income was recorded in the period
    const totalIncome = transactionIncome > 0 ? transactionIncome : Math.max(0, monthlyIncomeBaseline || 0);
    const totalExpenses = recent.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    const discretionaryExpenses = recent
        .filter(t => t.type === 'expense' && DISCRETIONARY_CATEGORIES.includes(t.category || ''))
        .reduce((s, t) => s + t.amount, 0);

    const savings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;

    const totalDebt = loans.reduce((s, l) => s + (l.remainingAmount || 0), 0);
    const monthlyDebtPayments = loans.reduce((s, l) => s + (l.monthlyInstallment || 0), 0);
    const debtToIncomeRatio = totalIncome > 0 ? monthlyDebtPayments / totalIncome : 0;

    const totalCreditLimit = creditCards.reduce((s, c) => s + (c.creditLimit || 0), 0);
    const totalCreditBalance = creditCards.reduce((s, c) => s + (c.currentBalance || 0), 0);
    const creditUtilization = totalCreditLimit > 0 ? totalCreditBalance / totalCreditLimit : 0;

    const totalAssets = goals.reduce((s, g) => s + (g.currentAmount || 0), 0);
    const netWorth = totalAssets - totalDebt - totalCreditBalance;

    // Emergency fund = money actually set aside for emergencies, in months of current spending
    const emergencyFund = goals.filter(isEmergencyGoal).reduce((s, g) => s + (g.currentAmount || 0), 0);
    const emergencyFundMonths = totalExpenses > 0
        ? emergencyFund / totalExpenses
        : (emergencyFund > 0 ? 12 : 0);

    let noDataReason: NoDataReason | null = null;
    if (recent.length === 0) noDataReason = 'no-transactions';
    else if (totalIncome <= 0) noDataReason = 'no-income';

    return {
        metrics: {
            totalIncome,
            totalExpenses,
            savings,
            savingsRate,
            totalDebt,
            debtToIncomeRatio,
            creditUtilization,
            emergencyFund,
            emergencyFundMonths,
            liquidityRatio: savingsRate,
            netWorth,
            discretionaryRatio: totalIncome > 0 ? discretionaryExpenses / totalIncome : 0,
        },
        noDataReason,
    };
};

export const calculateHealthScore = (metrics: HealthMetrics, goals: GoalLike[]): number => {
    let score = 100;

    // Savings rate
    if (metrics.savingsRate < 0.1) score -= 20;
    else if (metrics.savingsRate < 0.2) score -= 10;
    else if (metrics.savingsRate >= 0.3) score += 10;

    // Debt to income ratio
    if (metrics.debtToIncomeRatio > 0.4) score -= 25;
    else if (metrics.debtToIncomeRatio > 0.3) score -= 15;
    else if (metrics.debtToIncomeRatio > 0.2) score -= 5;

    // Credit utilization
    if (metrics.creditUtilization > 0.7) score -= 20;
    else if (metrics.creditUtilization > 0.5) score -= 10;
    else if (metrics.creditUtilization > 0.3) score -= 5;
    else if (metrics.creditUtilization < 0.1) score += 5;

    // Emergency fund
    if (metrics.emergencyFundMonths < 1) score -= 15;
    else if (metrics.emergencyFundMonths < 3) score -= 5;
    else if (metrics.emergencyFundMonths >= 6) score += 10;

    // Goals progress
    const activeGoals = goals.filter(g => g.status === 'In Progress');
    if (activeGoals.length === 0) score -= 5;
    else {
        const avgProgress = activeGoals.reduce((s, g) =>
            s + ((g.currentAmount || 0) / (g.targetAmount || 1)), 0) / activeGoals.length;
        if (avgProgress > 0.7) score += 10;
        else if (avgProgress > 0.4) score += 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
};

// One scale for every page (Financial Health, Dashboard) and the server
export const getHealthStatus = (score: number): { status: string; riskLevel: string } => {
    if (score >= 80) return { status: 'Excellent', riskLevel: 'Low' };
    if (score >= 60) return { status: 'Good', riskLevel: 'Medium' };
    if (score >= 40) return { status: 'Needs Work', riskLevel: 'High' };
    return { status: 'Critical', riskLevel: 'Very High' };
};

/**
 * Share of peers (0-100) the user is doing better than; ties count as half.
 * For metrics where lower is better (debt, credit use, spending), pass higherIsBetter = false.
 */
export const percentileAmong = (userValue: number, peerValues: number[], higherIsBetter = true): number => {
    if (peerValues.length === 0) return 50;
    let better = 0;
    for (const peer of peerValues) {
        if (peer === userValue) better += 0.5;
        else if (higherIsBetter ? userValue > peer : userValue < peer) better += 1;
    }
    return Math.round((better / peerValues.length) * 100);
};
