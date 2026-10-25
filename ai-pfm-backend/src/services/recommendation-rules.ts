// Rule-based recommendations built from the user's current health metrics.
// No database code here, so the rules can be unit tested.

import { HealthMetrics } from './health-score.utils';

export type RecommendationKey = 'savings-rate' | 'debt-to-income' | 'emergency-fund' | 'credit-utilization';

export interface RecommendationRule {
    key: RecommendationKey;
    category: 'budget' | 'goal' | 'debt' | 'subscription' | 'alert';
    title: string;
    reason: string;
    action: string;
    projectedImpact: string;
    executionPath: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    savingsAmount?: number; // extra LKR per month this would save, when it can be worked out
}

// Where "Execute" takes the user when it can't do the whole job by itself
export const RECOMMENDATION_LINKS: Record<RecommendationKey, string> = {
    'savings-rate': '/smart-budgets',
    'debt-to-income': '/loans',
    'emergency-fund': '/goals',
    'credit-utilization': '/credit-cards',
};

// Recommendations saved before keys existed are matched by their title
const LEGACY_TITLES: Record<string, RecommendationKey> = {
    'Increase Your Savings Rate': 'savings-rate',
    'Reduce High Debt-to-Income': 'debt-to-income',
    'Build Emergency Fund': 'emergency-fund',
    'High Credit Utilization': 'credit-utilization',
};

export const recommendationKeyOf = (rec: { key?: string | null; title?: string }): RecommendationKey | null =>
    (rec.key as RecommendationKey) || LEGACY_TITLES[rec.title || ''] || null;

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
const lkr = (v: number) => `LKR ${Math.round(v).toLocaleString('en-US')}`;

// Emergency fund target: 3 months of current spending (or income when there is no spending yet)
export const emergencyFundTarget = (metrics: HealthMetrics) =>
    Math.ceil((metrics.totalExpenses > 0 ? metrics.totalExpenses : metrics.totalIncome) * 3);

export const buildRecommendations = (metrics: HealthMetrics): RecommendationRule[] => {
    const rules: RecommendationRule[] = [];

    if (metrics.savingsRate < 0.1) {
        const shortfall = Math.max(0, Math.round(metrics.totalIncome * 0.1 - metrics.savings));
        rules.push({
            key: 'savings-rate',
            category: 'budget',
            title: 'Increase Your Savings Rate',
            reason: `You saved ${pct(metrics.savingsRate)} of your income in the last 30 days, below the recommended 10%.`,
            action: `Set budget limits so you keep at least ${lkr(shortfall)} more each month.`,
            projectedImpact: 'Build a safety net and increase your financial health score.',
            executionPath: 'Smart Budgets → Create Budget',
            priority: 'critical',
            savingsAmount: shortfall,
        });
    }

    if (metrics.debtToIncomeRatio > 0.3) {
        rules.push({
            key: 'debt-to-income',
            category: 'debt',
            title: 'Reduce High Debt-to-Income',
            reason: `Loan payments take ${pct(metrics.debtToIncomeRatio)} of your income, above the 30% guideline.`,
            action: 'Prioritize paying down high-interest debt, or compare payoff strategies.',
            projectedImpact: 'Free up cash flow and reduce interest payments.',
            executionPath: 'Loans → Strategies',
            priority: 'high',
        });
    }

    if (metrics.emergencyFundMonths < 3) {
        const target = emergencyFundTarget(metrics);
        rules.push({
            key: 'emergency-fund',
            category: 'goal',
            title: 'Build Emergency Fund',
            reason: `Your emergency savings cover ${metrics.emergencyFundMonths.toFixed(1)} months of expenses; 3-6 months is recommended.`,
            action: `Create an Emergency Fund goal of ${lkr(target)} (3 months of expenses).`,
            projectedImpact: 'Create a 3-6 month safety buffer for unexpected events.',
            executionPath: 'Goals → Emergency Fund (created for you)',
            priority: 'high',
        });
    }

    if (metrics.creditUtilization > 0.3) {
        rules.push({
            key: 'credit-utilization',
            category: 'alert',
            title: 'High Credit Utilization',
            reason: `You are using ${pct(metrics.creditUtilization)} of your credit limit; above 30% hurts your credit score.`,
            action: 'Pay down credit card balances before the statement date.',
            projectedImpact: 'Improve credit score and reduce interest charges.',
            executionPath: 'Cards → Select Card → Make Payment',
            priority: 'medium',
        });
    }

    return rules;
};
