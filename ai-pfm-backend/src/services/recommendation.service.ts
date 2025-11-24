// Recommendation Engine with Action Conversion
import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
    userId: string;
    type: 'BUDGET' | 'SAVINGS_GOAL' | 'DEBT_OPTIMIZATION' | 'SUBSCRIPTION_CLEANUP' | 'INVESTMENT';
    title: string;
    description: string;
    reason: string;
    projectedImpact: {
        financialSaving?: number;
        timeToGoal?: number;
        riskReduction?: number;
    };
    executionSteps: {
        stepNumber: number;
        action: string;
        automated: boolean;
        apiEndpoint?: string;
        parameters?: any;
    }[];
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'SNOOZED' | 'EXECUTED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    expiryDate?: Date;
    createdAt: Date;
    actionedAt?: Date;
    executionResults?: any;
}

const RecommendationSchema: Schema = new Schema({
    userId: { type: String, required: true },
    type: { 
        type: String, 
        enum: ['BUDGET', 'SAVINGS_GOAL', 'DEBT_OPTIMIZATION', 'SUBSCRIPTION_CLEANUP', 'INVESTMENT'],
        required: true 
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    reason: { type: String, required: true },
    projectedImpact: {
        financialSaving: Number,
        timeToGoal: Number,
        riskReduction: Number
    },
    executionSteps: [{
        stepNumber: Number,
        action: String,
        automated: Boolean,
        apiEndpoint: String,
        parameters: Schema.Types.Mixed
    }],
    status: { 
        type: String, 
        enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'SNOOZED', 'EXECUTED'],
        default: 'PENDING'
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    expiryDate: Date,
    actionedAt: Date,
    executionResults: Schema.Types.Mixed
}, { timestamps: true });

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);

export class RecommendationEngine {
    
    /**
     * Generate personalized recommendations based on financial data
     */
    async generateRecommendations(userId: string, financialData: any): Promise<IRecommendation[]> {
        const recommendations: Partial<IRecommendation>[] = [];
        
        // 1. Budget Optimization
        const budgetRec = await this.generateBudgetRecommendation(userId, financialData);
        if (budgetRec) recommendations.push(budgetRec);
        
        // 2. Savings Goals
        const savingsRec = await this.generateSavingsRecommendation(userId, financialData);
        if (savingsRec) recommendations.push(savingsRec);
        
        // 3. Debt Optimization
        const debtRec = await this.generateDebtRecommendation(userId, financialData);
        if (debtRec) recommendations.push(debtRec);
        
        // 4. Subscription Cleanup
        const subscriptionRec = await this.generateSubscriptionRecommendation(userId, financialData);
        if (subscriptionRec) recommendations.push(subscriptionRec);
        
        // Save to database
        const savedRecommendations = await Promise.all(
            recommendations.map(rec => new Recommendation({ ...rec, userId }).save())
        );
        
        return savedRecommendations;
    }

    /**
     * Execute accepted recommendations automatically
     */
    async executeRecommendation(recommendationId: string): Promise<{
        success: boolean;
        results: any;
        errors?: string[];
    }> {
        const recommendation = await Recommendation.findById(recommendationId);
        if (!recommendation || recommendation.status !== 'ACCEPTED') {
            throw new Error('Recommendation not found or not accepted');
        }

        const executionResults: any = {};
        const errors: string[] = [];

        try {
            for (const step of recommendation.executionSteps) {
                if (step.automated) {
                    const result = await this.executeAutomatedStep(step);
                    executionResults[`step_${step.stepNumber}`] = result;
                } else {
                    // Log manual step for user to complete
                    executionResults[`step_${step.stepNumber}`] = {
                        status: 'MANUAL_ACTION_REQUIRED',
                        action: step.action
                    };
                }
            }

            // Update recommendation status
            recommendation.status = 'EXECUTED';
            recommendation.actionedAt = new Date();
            recommendation.executionResults = executionResults;
            await recommendation.save();

            return { success: true, results: executionResults };

        } catch (error: any) {
            errors.push(error.message);
            return { success: false, results: executionResults, errors };
        }
    }

    private async generateBudgetRecommendation(userId: string, data: any): Promise<Partial<IRecommendation> | null> {
        // Analyze spending patterns and suggest budget adjustments
        const overspendingCategories = this.findOverspendingCategories(data.categorySpending);
        
        if (overspendingCategories.length === 0) return null;

        return {
            type: 'BUDGET',
            title: `Optimize ${overspendingCategories[0].category} Budget`,
            description: `Your ${overspendingCategories[0].category.toLowerCase()} spending is 40% above recommended levels`,
            reason: `Spending LKR ${overspendingCategories[0].amount} vs recommended LKR ${overspendingCategories[0].recommended}`,
            projectedImpact: {
                financialSaving: overspendingCategories[0].amount - overspendingCategories[0].recommended
            },
            executionSteps: [
                {
                    stepNumber: 1,
                    action: 'Set budget alert for dining expenses',
                    automated: true,
                    apiEndpoint: '/api/budget/create-alert',
                    parameters: {
                        category: overspendingCategories[0].category,
                        limit: overspendingCategories[0].recommended,
                        alertThreshold: 0.8
                    }
                },
                {
                    stepNumber: 2,
                    action: 'Review and approve monthly budget plan',
                    automated: false
                }
            ],
            priority: 'HIGH',
            expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };
    }

    private async generateSavingsRecommendation(userId: string, data: any): Promise<Partial<IRecommendation> | null> {
        const monthlySurplus = data.monthlyIncome - data.monthlyExpenses;
        
        if (monthlySurplus <= 0) return null;

        const recommendedSavings = monthlySurplus * 0.2; // 20% of surplus

        return {
            type: 'SAVINGS_GOAL',
            title: 'Emergency Fund Goal',
            description: 'Build your emergency fund to 6 months of expenses',
            reason: `You have LKR ${monthlySurplus.toLocaleString()} monthly surplus available`,
            projectedImpact: {
                timeToGoal: 30, // months
                riskReduction: 25
            },
            executionSteps: [
                {
                    stepNumber: 1,
                    action: 'Open dedicated savings account',
                    automated: true,
                    apiEndpoint: '/api/accounts/create-savings',
                    parameters: {
                        accountType: 'EMERGENCY_FUND',
                        initialDeposit: recommendedSavings
                    }
                },
                {
                    stepNumber: 2,
                    action: 'Set up automatic monthly transfer',
                    automated: true,
                    apiEndpoint: '/api/transfers/schedule',
                    parameters: {
                        amount: recommendedSavings,
                        frequency: 'MONTHLY',
                        purpose: 'EMERGENCY_FUND'
                    }
                }
            ],
            priority: 'MEDIUM'
        };
    }

    private async generateDebtRecommendation(userId: string, data: any): Promise<Partial<IRecommendation> | null> {
        const highInterestDebts = data.debts?.filter((debt: any) => debt.interestRate > 15);
        
        if (!highInterestDebts || highInterestDebts.length === 0) return null;

        const totalHighInterestDebt = highInterestDebts.reduce((sum: number, debt: any) => sum + debt.amount, 0);
        const potentialSavings = totalHighInterestDebt * 0.05; // Assume 5% interest reduction

        return {
            type: 'DEBT_OPTIMIZATION',
            title: 'Convert High-Interest Debt to Personal Loan',
            description: 'Reduce interest costs by consolidating credit card debt',
            reason: `You have LKR ${totalHighInterestDebt.toLocaleString()} in high-interest debt (>15% APR)`,
            projectedImpact: {
                financialSaving: potentialSavings
            },
            executionSteps: [
                {
                    stepNumber: 1,
                    action: 'Check personal loan eligibility',
                    automated: true,
                    apiEndpoint: '/api/loans/check-eligibility',
                    parameters: {
                        amount: totalHighInterestDebt,
                        purpose: 'DEBT_CONSOLIDATION'
                    }
                },
                {
                    stepNumber: 2,
                    action: 'Review and accept loan terms',
                    automated: false
                },
                {
                    stepNumber: 3,
                    action: 'Schedule automatic debt payments',
                    automated: true,
                    apiEndpoint: '/api/payments/schedule',
                    parameters: {
                        debts: highInterestDebts.map((d: any) => d.id)
                    }
                }
            ],
            priority: 'HIGH'
        };
    }

    private async generateSubscriptionRecommendation(userId: string, data: any): Promise<Partial<IRecommendation> | null> {
        const subscriptions = data.subscriptions || [];
        const unusedSubscriptions = subscriptions.filter((sub: any) => 
            sub.lastUsed && new Date(sub.lastUsed) < new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) // 60 days
        );

        if (unusedSubscriptions.length === 0) return null;

        const potentialSavings = unusedSubscriptions.reduce((sum: number, sub: any) => sum + sub.monthlyFee, 0);

        return {
            type: 'SUBSCRIPTION_CLEANUP',
            title: 'Cancel Unused Subscriptions',
            description: `Save LKR ${potentialSavings.toLocaleString()} per month by canceling unused services`,
            reason: `${unusedSubscriptions.length} subscriptions unused for 60+ days`,
            projectedImpact: {
                financialSaving: potentialSavings * 12 // Annual savings
            },
            executionSteps: [
                {
                    stepNumber: 1,
                    action: 'Review subscription usage report',
                    automated: false
                },
                {
                    stepNumber: 2,
                    action: 'Cancel selected subscriptions',
                    automated: true,
                    apiEndpoint: '/api/subscriptions/bulk-cancel',
                    parameters: {
                        subscriptionIds: unusedSubscriptions.map((s: any) => s.id)
                    }
                }
            ],
            priority: 'MEDIUM'
        };
    }

    private async executeAutomatedStep(step: any): Promise<any> {
        // This would integrate with various banking APIs
        switch (step.apiEndpoint) {
            case '/api/budget/create-alert':
                return await this.createBudgetAlert(step.parameters);
            case '/api/accounts/create-savings':
                return await this.createSavingsAccount(step.parameters);
            case '/api/transfers/schedule':
                return await this.scheduleTransfer(step.parameters);
            case '/api/loans/check-eligibility':
                return await this.checkLoanEligibility(step.parameters);
            case '/api/subscriptions/bulk-cancel':
                return await this.cancelSubscriptions(step.parameters);
            default:
                throw new Error(`Unknown API endpoint: ${step.apiEndpoint}`);
        }
    }

    private async createBudgetAlert(params: any): Promise<any> {
        // Integration with budget/alert system
        return { success: true, alertId: 'alert_123' };
    }

    private async createSavingsAccount(params: any): Promise<any> {
        // Integration with core banking system
        return { success: true, accountNumber: 'SAV_789' };
    }

    private async scheduleTransfer(params: any): Promise<any> {
        // Integration with transfer system
        return { success: true, transferId: 'TRF_456' };
    }

    private async checkLoanEligibility(params: any): Promise<any> {
        // Integration with loan system
        return { eligible: true, maxAmount: params.amount, interestRate: 12.5 };
    }

    private async cancelSubscriptions(params: any): Promise<any> {
        // Integration with subscription management
        return { canceledCount: params.subscriptionIds.length };
    }

    private findOverspendingCategories(categorySpending: any): any[] {
        // Mock implementation - would use real budget analysis
        return [
            { category: 'Dining', amount: 25000, recommended: 18000 }
        ];
    }
}