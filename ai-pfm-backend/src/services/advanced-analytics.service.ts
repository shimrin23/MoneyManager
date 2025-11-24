// Advanced Analytics Service for Budget Modeling and Cash Flow Forecasting
import Transaction from '../schemas/transaction.schema';
import FinancialHealth from '../schemas/financial_health.schema';

interface BudgetModel {
    category: string;
    recommendedBudget: number;
    historicalAverage: number;
    seasonalAdjustment: number;
    peerComparison: number;
    confidence: number;
}

interface CashFlowForecast {
    date: string;
    predictedBalance: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendedActions: string[];
}

export class AdvancedAnalyticsService {
    
    /**
     * Generate personalized category-level budgets using ML-like approach
     */
    async generatePersonalizedBudgets(userId: string): Promise<BudgetModel[]> {
        const transactions = await Transaction.find({ userId });
        const last3Months = this.getLastNMonths(transactions, 3);
        const last12Months = this.getLastNMonths(transactions, 12);
        
        const categorySpending = this.groupByCategory(last3Months);
        const budgets: BudgetModel[] = [];
        
        for (const [category, amounts] of Object.entries(categorySpending)) {
            const historicalAverage = this.calculateAverage(amounts);
            const seasonalAdjustment = this.calculateSeasonalAdjustment(category, last12Months);
            const peerComparison = await this.getPeerComparison(category, historicalAverage);
            
            budgets.push({
                category,
                recommendedBudget: Math.round(historicalAverage * seasonalAdjustment),
                historicalAverage,
                seasonalAdjustment,
                peerComparison,
                confidence: this.calculateBudgetConfidence(amounts.length, historicalAverage)
            });
        }
        
        return budgets;
    }

    /**
     * Time-series forecasting for cash flow prediction
     */
    async forecastCashFlow(userId: string, days: number = 30): Promise<CashFlowForecast[]> {
        const transactions = await Transaction.find({ userId });
        const dailyBalances = this.calculateDailyBalances(transactions);
        
        const forecasts: CashFlowForecast[] = [];
        let currentBalance = dailyBalances[dailyBalances.length - 1]?.balance || 0;
        
        for (let i = 1; i <= days; i++) {
            const forecastDate = new Date();
            forecastDate.setDate(forecastDate.getDate() + i);
            
            // Simple moving average for predicted daily change
            const predictedChange = this.predictDailyChange(transactions, i);
            currentBalance += predictedChange;
            
            const riskLevel = this.assessCashFlowRisk(currentBalance, predictedChange);
            const recommendedActions = this.generateCashFlowActions(riskLevel, currentBalance);
            
            forecasts.push({
                date: forecastDate.toISOString().split('T')[0],
                predictedBalance: Math.round(currentBalance),
                riskLevel,
                recommendedActions
            });
        }
        
        return forecasts;
    }

    /**
     * Enhanced Financial Health Scoring with multiple factors
     */
    async calculateAdvancedHealthScore(userId: string): Promise<{
        score: number;
        breakdown: Record<string, number>;
        riskLevel: string;
        improvements: string[];
    }> {
        const transactions = await Transaction.find({ userId });
        
        // Calculate individual factors (0-100 each)
        const liquidityScore = this.calculateLiquidityScore(transactions);
        const savingsScore = this.calculateSavingsHabitScore(transactions);
        const debtScore = this.calculateDebtScore(transactions);
        const feeScore = this.calculateFeeFrequencyScore(transactions);
        const stabilityScore = this.calculateIncomeStabilityScore(transactions);
        
        // Weighted composite score
        const weights = {
            liquidity: 0.25,
            savings: 0.20,
            debt: 0.25,
            fees: 0.15,
            stability: 0.15
        };
        
        const score = Math.round(
            liquidityScore * weights.liquidity +
            savingsScore * weights.savings +
            debtScore * weights.debt +
            feeScore * weights.fees +
            stabilityScore * weights.stability
        );
        
        const breakdown = {
            liquidity: liquidityScore,
            savings: savingsScore,
            debt: debtScore,
            fees: feeScore,
            stability: stabilityScore
        };
        
        const riskLevel = score > 70 ? 'Low' : score > 40 ? 'Medium' : 'High';
        const improvements = this.generateImprovementSuggestions(breakdown);
        
        // Save to database
        await FinancialHealth.findOneAndUpdate(
            { userId },
            { 
                score, 
                riskLevel,
                metrics: {
                    liquidityRatio: liquidityScore / 100,
                    debtToIncomeRatio: (100 - debtScore) / 100,
                    savingsRate: savingsScore / 100
                },
                breakdown,
                improvements
            },
            { upsert: true, new: true }
        );
        
        return { score, breakdown, riskLevel, improvements };
    }

    /**
     * Debt Optimization with Avalanche vs Snowball analysis
     */
    async analyzeDebtOptimization(userId: string): Promise<{
        currentDebts: any[];
        avalancheStrategy: any;
        snowballStrategy: any;
        recommendedStrategy: string;
        potentialSavings: number;
    }> {
        // This would integrate with loan and credit card schemas
        const debts = await this.getCurrentDebts(userId);
        
        const avalancheStrategy = this.calculateAvalancheStrategy(debts);
        const snowballStrategy = this.calculateSnowballStrategy(debts);
        
        const recommendedStrategy = avalancheStrategy.totalInterest < snowballStrategy.totalInterest 
            ? 'avalanche' : 'snowball';
        
        const potentialSavings = Math.abs(avalancheStrategy.totalInterest - snowballStrategy.totalInterest);
        
        return {
            currentDebts: debts,
            avalancheStrategy,
            snowballStrategy,
            recommendedStrategy,
            potentialSavings
        };
    }

    // Helper methods
    private getLastNMonths(transactions: any[], months: number): any[] {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - months);
        return transactions.filter(t => new Date(t.date) > cutoffDate);
    }

    private groupByCategory(transactions: any[]): Record<string, number[]> {
        const grouped: Record<string, number[]> = {};
        transactions.forEach(t => {
            if (!grouped[t.category]) grouped[t.category] = [];
            grouped[t.category].push(t.amount);
        });
        return grouped;
    }

    private calculateAverage(amounts: number[]): number {
        return amounts.reduce((a, b) => a + b, 0) / amounts.length;
    }

    private calculateSeasonalAdjustment(category: string, yearData: any[]): number {
        // Simple seasonal adjustment - in real implementation, use more sophisticated algorithms
        const seasonalCategories: Record<string, number> = {
            'Entertainment': 1.2, // Higher in holiday seasons
            'Utilities': 0.9,     // Lower in mild weather
            'Groceries': 1.0,     // Stable
            'Transport': 1.1      // Higher during vacation seasons
        };
        return seasonalCategories[category] || 1.0;
    }

    private async getPeerComparison(category: string, amount: number): Promise<number> {
        // Mock peer comparison - in real implementation, aggregate anonymized data
        const peerAverages: Record<string, number> = {
            'Groceries': 25000,
            'Entertainment': 15000,
            'Transport': 12000,
            'Utilities': 8000
        };
        const peerAverage = peerAverages[category] || amount;
        return (amount / peerAverage) * 100; // Percentage vs peer average
    }

    private calculateBudgetConfidence(dataPoints: number, average: number): number {
        // Higher confidence with more data points and consistent spending
        return Math.min(0.95, (dataPoints / 12) * 0.8 + 0.2);
    }

    private calculateDailyBalances(transactions: any[]): any[] {
        // Calculate running balance day by day
        // Implementation depends on account balance tracking
        return [];
    }

    private predictDailyChange(transactions: any[], dayOffset: number): number {
        // Simple prediction based on historical patterns
        // In real implementation, use time-series forecasting algorithms
        const dailyAverage = transactions.reduce((sum, t) => sum + t.amount, 0) / 30;
        return dailyAverage * (Math.random() * 0.2 - 0.1); // Add some variance
    }

    private assessCashFlowRisk(balance: number, dailyChange: number): 'LOW' | 'MEDIUM' | 'HIGH' {
        if (balance < 10000 && dailyChange < 0) return 'HIGH';
        if (balance < 50000 && dailyChange < -1000) return 'MEDIUM';
        return 'LOW';
    }

    private generateCashFlowActions(risk: string, balance: number): string[] {
        switch (risk) {
            case 'HIGH':
                return ['Consider reducing discretionary spending', 'Transfer from savings if available'];
            case 'MEDIUM':
                return ['Monitor expenses closely', 'Postpone large purchases'];
            default:
                return ['Maintain current spending pattern'];
        }
    }

    private calculateLiquidityScore(transactions: any[]): number {
        // Calculate based on cash buffer and income stability
        return 75; // Placeholder
    }

    private calculateSavingsHabitScore(transactions: any[]): number {
        // Calculate based on regular savings transfers
        return 60; // Placeholder
    }

    private calculateDebtScore(transactions: any[]): number {
        // Calculate based on debt-to-income ratio
        return 80; // Placeholder
    }

    private calculateFeeFrequencyScore(transactions: any[]): number {
        // Calculate based on overdraft fees, late payment fees
        const feeTransactions = transactions.filter(t => 
            t.category === 'Fees' || t.description?.includes('fee')
        );
        return Math.max(0, 100 - (feeTransactions.length * 10));
    }

    private calculateIncomeStabilityScore(transactions: any[]): number {
        // Calculate based on income consistency
        return 85; // Placeholder
    }

    private generateImprovementSuggestions(breakdown: Record<string, number>): string[] {
        const suggestions: string[] = [];
        
        if (breakdown.liquidity < 50) {
            suggestions.push('Build emergency fund to 3-6 months expenses');
        }
        if (breakdown.savings < 50) {
            suggestions.push('Set up automatic savings transfers');
        }
        if (breakdown.debt < 50) {
            suggestions.push('Consider debt consolidation or repayment plan');
        }
        
        return suggestions;
    }

    private async getCurrentDebts(userId: string): Promise<any[]> {
        // Integration with loan and credit card schemas
        return [];
    }

    private calculateAvalancheStrategy(debts: any[]): any {
        // Implement debt avalanche calculation
        return { totalInterest: 0, payoffTime: 0 };
    }

    private calculateSnowballStrategy(debts: any[]): any {
        // Implement debt snowball calculation  
        return { totalInterest: 0, payoffTime: 0 };
    }
}