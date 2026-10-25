import Transaction from '../schemas/transaction.schema';
import FinancialHealth from '../schemas/financial_health.schema';
import Goal from '../schemas/goal.schema';
import Loan from '../schemas/loan.schema';
import CreditCard from '../schemas/creditcard.schema';
import User from '../schemas/user.schema';
import { FinancialAgent } from '../ai/agent'; // Import the real AI agent
import {
    HEALTH_WINDOW_DAYS,
    HealthMetrics,
    calculateFinancialMetrics,
    calculateHealthScore,
    getHealthStatus,
    percentileAmong,
} from './health-score.utils';

// Peer comparison needs at least this many other users with a score
const MIN_PEERS = 3;

export class FinancialHealthService {
    private financialAgent: FinancialAgent;

    constructor() {
        this.financialAgent = new FinancialAgent();
    }

    // Enhanced health score calculation
    async calculateComprehensiveHealthScore(userId: string): Promise<any> {
        try {
            const [transactions, goals, loans, creditCards, user] = await Promise.all([
                Transaction.find({ userId }),
                Goal.find({ userId }),
                Loan.find({ userId, status: 'Active' }),
                CreditCard.find({ userId }),
                User.findById(userId).select('monthlyIncome')
            ]);

            const { metrics, noDataReason } = calculateFinancialMetrics(
                transactions,
                loans,
                creditCards,
                Number(user?.monthlyIncome ?? 0),
                goals
            );

            // Without income and spending in the last 30 days a score would be made up
            if (noDataReason) {
                const healthData = {
                    userId,
                    hasData: false,
                    noDataReason,
                    score: null,
                    status: null,
                    riskLevel: null,
                    windowDays: HEALTH_WINDOW_DAYS,
                    metrics,
                    recommendations: [] as string[]
                };
                await FinancialHealth.findOneAndUpdate({ userId }, healthData, { upsert: true, new: true });
                return healthData;
            }

            // Calculate score based on multiple factors
            const score = calculateHealthScore(metrics, goals);
            const { status, riskLevel } = getHealthStatus(score);

            const healthData = {
                userId,
                hasData: true,
                noDataReason: null,
                score,
                status,
                riskLevel,
                windowDays: HEALTH_WINDOW_DAYS,
                metrics,
                recommendations: this.generateRecommendations(metrics)
            };

            // Save to database
            await FinancialHealth.findOneAndUpdate(
                { userId },
                healthData,
                { upsert: true, new: true }
            );

            return healthData;
        } catch (error) {
            console.error('Error calculating health score:', error);
            throw error;
        }
    }

    private generateRecommendations(metrics: HealthMetrics): string[] {
        const recommendations: string[] = [];

        // Basic rule-based recommendations
        if (metrics.savingsRate < 0.1) {
            recommendations.push('Increase your savings rate to at least 10% of income');
        }

        if (metrics.debtToIncomeRatio > 0.3) {
            recommendations.push('Consider debt consolidation or aggressive debt payoff strategy');
        }

        if (metrics.creditUtilization > 0.3) {
            recommendations.push('Reduce credit card utilization below 30% to improve credit score');
        }

        if (metrics.emergencyFundMonths < 3) {
            recommendations.push('Build an emergency fund covering 3-6 months of expenses');
        }

        return recommendations;
    }

    // Get comprehensive financial health report
    async getHealthReport(userId: string): Promise<any> {
        try {
            // Recompute on demand so the score reflects current transactions, loans, and goals.
            return await this.calculateComprehensiveHealthScore(userId);
        } catch (error) {
            console.error('Error getting health report:', error);
            throw error;
        }
    }

    /**
     * Compares the user with other users who have a score. Averages and percentiles
     * come from those users only (never the user's own record), and nothing is shown
     * until there are enough of them to compare with.
     */
    async getPeerBenchmarks(userId: string): Promise<any> {
        try {
            const health = await this.getHealthReport(userId);
            if (!health.hasData) {
                return { benchmarks: [], peerCount: 0, reason: 'no-data' };
            }
            const metrics: HealthMetrics = health.metrics;

            const peers = await FinancialHealth.find({ userId: { $ne: userId }, score: { $ne: null } })
                .select('score metrics')
                .lean();
            if (peers.length < MIN_PEERS) {
                return { benchmarks: [], peerCount: peers.length, reason: 'not-enough-peers', minPeers: MIN_PEERS };
            }

            const pct = (v: number) => Number((v * 100).toFixed(1));
            const values = (pick: (p: any) => number | undefined) =>
                peers.map(pick).filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
            const avg = (list: number[]) => (list.length ? list.reduce((s, v) => s + v, 0) / list.length : 0);

            // [label, user value, peer values, higher is better, display transform]
            const rows: [string, number, number[], boolean, (v: number) => number][] = [
                ['Financial Health Score', health.score, values(p => p.score), true, v => Math.round(v)],
                ['Savings Rate', metrics.savingsRate, values(p => p.metrics?.savingsRate), true, pct],
                ['Debt-to-Income Ratio', metrics.debtToIncomeRatio, values(p => p.metrics?.debtToIncomeRatio), false, pct],
                ['Liquidity Ratio', metrics.liquidityRatio, values(p => p.metrics?.liquidityRatio), true, pct],
                ['Credit Utilization', metrics.creditUtilization, values(p => p.metrics?.creditUtilization), false, pct],
                ['Emergency Fund Health', metrics.emergencyFundMonths, values(p => p.metrics?.emergencyFundMonths), true, v => Number(v.toFixed(1))],
                ['Net Worth', metrics.netWorth, values(p => p.metrics?.netWorth), true, v => Math.round(v)],
                ['Discretionary Ratio', metrics.discretionaryRatio, values(p => p.metrics?.discretionaryRatio), false, pct],
            ];

            const benchmarks = rows.map(([category, userRaw, peerValues, higherIsBetter, show]) => {
                const userValue = show(userRaw);
                const peerAverage = show(avg(peerValues));
                const comparison = userValue === peerAverage ? 'average' : userValue > peerAverage ? 'above' : 'below';
                return {
                    category,
                    userValue,
                    peerAverage,
                    percentile: percentileAmong(userRaw, peerValues, higherIsBetter),
                    higherIsBetter,
                    comparison
                };
            });

            return { benchmarks, peerCount: peers.length };
        } catch (error) {
            console.error('Error getting peer benchmarks:', error);
            throw error;
        }
    }

    // Get AI-powered financial analysis using real Gemini AI
    async getAIAnalysis(userId: string): Promise<string> {
        try {
            // Get recent transactions for AI analysis
            const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(100);

            if (transactions.length === 0) {
                return "I notice you don't have any transactions yet. Start by adding some transactions to get personalized AI-powered insights about your spending patterns and financial health!";
            }

            // Use the real AI agent to analyze spending patterns
            console.log('🤖 Generating AI analysis using Gemini...');
            const aiAnalysis = await this.financialAgent.analyzeSpending(transactions);

            return aiAnalysis;
        } catch (error) {
            console.error('Error generating AI analysis:', error);
            return 'I\'m currently having trouble analyzing your financial data. Please try again in a moment.';
        }
    }
}
