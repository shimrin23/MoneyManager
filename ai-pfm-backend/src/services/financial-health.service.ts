import Transaction from '../schemas/transaction.schema';
import FinancialHealth from '../schemas/financial_health.schema';
import Goal from '../schemas/goal.schema';
import Loan from '../schemas/loan.schema';
import CreditCard from '../schemas/creditcard.schema';
import { FinancialAgent } from '../ai/agent'; // Import the real AI agent

export class FinancialHealthService {
    private financialAgent: FinancialAgent;

    constructor() {
        this.financialAgent = new FinancialAgent();
    }

    // Enhanced health score calculation
    async calculateComprehensiveHealthScore(userId: string): Promise<any> {
        try {
            const [transactions, goals, loans, creditCards] = await Promise.all([
                Transaction.find({ userId }),
                Goal.find({ userId }),
                Loan.find({ userId, status: 'Active' }),
                CreditCard.find({ userId })
            ]);

            // Calculate basic financial metrics
            const metrics = this.calculateFinancialMetrics(transactions, loans, creditCards);
            
            // Calculate score based on multiple factors
            const score = this.calculateHealthScore(metrics, goals, loans, creditCards);
            
            // Generate AI-powered recommendations
            const recommendations = await this.generateRecommendations(userId, metrics, score);

            // Save to database
            const healthData = {
                userId,
                score,
                riskLevel: this.getRiskLevel(score),
                metrics,
                recommendations
            };

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

    private calculateFinancialMetrics(transactions: any[], loans: any[], creditCards: any[]) {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        
        // Recent transactions (last 30 days)
        const recentTransactions = transactions.filter(t => new Date(t.date) >= lastMonth);
        
        const totalIncome = recentTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpenses = recentTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? savings / totalIncome : 0;

        // Debt calculations
        const totalDebt = loans.reduce((sum, loan) => sum + loan.remainingAmount, 0);
        const monthlyDebtPayments = loans.reduce((sum, loan) => sum + loan.monthlyInstallment, 0);
        const debtToIncomeRatio = totalIncome > 0 ? monthlyDebtPayments / totalIncome : 0;

        // Credit utilization
        const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.creditLimit, 0);
        const totalCreditBalance = creditCards.reduce((sum, card) => sum + card.currentBalance, 0);
        const creditUtilization = totalCreditLimit > 0 ? totalCreditBalance / totalCreditLimit : 0;

        // Emergency fund (simplified - based on savings rate)
        const monthlyExpenses = totalExpenses;
        const emergencyFundMonths = monthlyExpenses > 0 ? Math.max(savings, 0) / monthlyExpenses : 0;

        return {
            totalIncome,
            totalExpenses,
            savings,
            savingsRate,
            totalDebt,
            debtToIncomeRatio,
            creditUtilization,
            emergencyFundMonths,
            liquidityRatio: savingsRate
        };
    }

    private calculateHealthScore(metrics: any, goals: any[], loans: any[], creditCards: any[]): number {
        let score = 100;

        // Savings rate (30 points)
        if (metrics.savingsRate < 0.1) score -= 20;
        else if (metrics.savingsRate < 0.2) score -= 10;
        else if (metrics.savingsRate >= 0.3) score += 10;

        // Debt to income ratio (25 points)
        if (metrics.debtToIncomeRatio > 0.4) score -= 25;
        else if (metrics.debtToIncomeRatio > 0.3) score -= 15;
        else if (metrics.debtToIncomeRatio > 0.2) score -= 5;

        // Credit utilization (20 points)
        if (metrics.creditUtilization > 0.7) score -= 20;
        else if (metrics.creditUtilization > 0.5) score -= 10;
        else if (metrics.creditUtilization > 0.3) score -= 5;
        else if (metrics.creditUtilization < 0.1) score += 5;

        // Emergency fund (15 points)
        if (metrics.emergencyFundMonths < 1) score -= 15;
        else if (metrics.emergencyFundMonths < 3) score -= 5;
        else if (metrics.emergencyFundMonths >= 6) score += 10;

        // Goals progress (10 points)
        const activeGoals = goals.filter(g => g.status === 'In Progress');
        if (activeGoals.length === 0) score -= 5;
        else {
            const avgProgress = activeGoals.reduce((sum, goal) => 
                sum + (goal.currentAmount / goal.targetAmount), 0) / activeGoals.length;
            if (avgProgress > 0.7) score += 10;
            else if (avgProgress > 0.4) score += 5;
        }

        return Math.max(0, Math.min(100, Math.round(score)));
    }

    private getRiskLevel(score: number): string {
        if (score >= 80) return 'Low';
        if (score >= 60) return 'Medium';
        if (score >= 40) return 'Moderate';
        return 'High';
    }

    private async generateRecommendations(userId: string, metrics: any, score: number): Promise<string[]> {
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
            const health = await FinancialHealth.findOne({ userId });
            if (!health) {
                return await this.calculateComprehensiveHealthScore(userId);
            }

            // Check if data is stale (older than 1 day)
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (health.lastUpdated < dayAgo) {
                return await this.calculateComprehensiveHealthScore(userId);
            }

            return health;
        } catch (error) {
            console.error('Error getting health report:', error);
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