// src/services/analytics.service.ts
import Transaction from '../schemas/transaction.schema';
import FinancialHealth from '../schemas/financial_health.schema';

export class AnalyticsService {
    
    // Calculate and Save the score
    async calculateHealthScore(userId: string): Promise<number> {
        // 1. Get all transactions for this user (Currently getting ALL for demo purposes)
        // In a real app with login, you would filter: { userId: userId }
        const transactions = await Transaction.find(); 
        
        // 2. Initialize variables
        let totalIncome = 0;
        let totalExpenses = 0;
        let loanPayments = 0;
        
        // 3. Loop through transactions to sum up totals
        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else if (t.type === 'expense') {
                totalExpenses += t.amount;
                // Check if this expense is related to debt
                if (t.category === 'Loan' || t.category === 'Debt') {
                    loanPayments += t.amount;
                }
            }
        });

        // 4. Calculate the Score Logic (0 to 100)
        let score = 100;

        if (totalIncome > 0) {
            const savingsRate = (totalIncome - totalExpenses) / totalIncome;
            const debtRatio = loanPayments / totalIncome;

            // Logic: Start at 50. Add points for saving, subtract points for heavy debt.
            score = 50 + (savingsRate * 50) - (debtRatio * 50);
        } else {
            score = 0; // No income = 0 score
        }

        // Clamp score between 0 and 100
        score = Math.max(0, Math.min(100, Math.round(score)));

        // 5. Save the result to the FinancialHealth collection
        await FinancialHealth.findOneAndUpdate(
            { userId: "demo_user" }, // Hardcoded user for MVP
            { 
                score: score, 
                metrics: { 
                    liquidityRatio: totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0,
                    debtToIncomeRatio: totalIncome > 0 ? loanPayments / totalIncome : 0,
                    savingsRate: totalIncome > 0 ? (totalIncome - totalExpenses) : 0
                },
                riskLevel: score > 70 ? 'Low' : (score > 40 ? 'Medium' : 'High')
            },
            { upsert: true, new: true } // Create if doesn't exist
        );

        return score;
    }

    // Helper to just get the current score
    async getScore(userId: string): Promise<number> {
        const health = await FinancialHealth.findOne({ userId: "demo_user" });
        return health ? health.score : 0;
    }
}