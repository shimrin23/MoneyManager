import Transaction from '../schemas/transaction.schema';
import FinancialHealth from '../schemas/financial_health.schema';

export class AnalyticsService {
    
    // Calculate and Save the score
    async calculateHealthScore(userId: string): Promise<number> {
        const transactions = await Transaction.find({ userId }); 
        
        let totalIncome = 0;
        let totalExpenses = 0;
        let loanPayments = 0;
        
        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else if (t.type === 'expense') {
                totalExpenses += t.amount;
                if (t.category === 'Loan' || t.category === 'Debt') {
                    loanPayments += t.amount;
                }
            }
        });

        let score = 100;

        if (totalIncome > 0) {
            const savingsRate = (totalIncome - totalExpenses) / totalIncome;
            const debtRatio = loanPayments / totalIncome;
            score = 50 + (savingsRate * 50) - (debtRatio * 50);
        } else {
            score = 0; 
        }

        score = Math.max(0, Math.min(100, Math.round(score)));

        await FinancialHealth.findOneAndUpdate(
            { userId: userId }, 
            { 
                score: score, 
                metrics: { 
                    liquidityRatio: totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0,
                    debtToIncomeRatio: totalIncome > 0 ? loanPayments / totalIncome : 0,
                    savingsRate: totalIncome > 0 ? (totalIncome - totalExpenses) : 0
                },
                riskLevel: score > 70 ? 'Low' : (score > 40 ? 'Medium' : 'High')
            },
            { upsert: true, new: true }
        );

        return score;
    }

    // Helper to just get the current score
    async getScore(userId: string): Promise<number> {
        const health = await FinancialHealth.findOne({ userId: userId });
        return health ? health.score : 0;
    }

    // --- NEW METHOD WITH FIX ---
    async getSubscriptions(userId: string) {
        const transactions = await Transaction.find({ userId });
        
        // Simple keyword detection (MVP approach)
        const subscriptionKeywords = ['Netflix', 'Spotify', 'Apple', 'Gym', 'Prime', 'Zoom', 'Hulu'];
        
        const foundSubscriptions: any[] = [];
        const seen = new Set();

        transactions.forEach(t => {
            // FIX: Use (t.description || '') to handle cases where description is missing
            const desc = t.description || '';
            
            // Check if description matches a known subscription service
            const match = subscriptionKeywords.find(k => desc.includes(k));
            
            // Prevent duplicates (only show unique subscriptions)
            if (match && !seen.has(match)) {
                foundSubscriptions.push({
                    name: desc, // Use the actual description from the transaction
                    amount: t.amount,
                    risk: t.amount > 50 ? 'High' : 'Low' // Flag expensive subs
                });
                seen.add(match);
            }
        });

        return foundSubscriptions;
    }
}