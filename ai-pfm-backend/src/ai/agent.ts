import { GoogleGenerativeAI } from "@google/generative-ai";
import { ITransaction } from '../schemas/transaction.schema';
import { FINANCIAL_ADVISOR_PROMPT } from './prompts';
import { AnalyticsService } from '../services/analytics.service'; 
import dotenv from 'dotenv';

dotenv.config();

export class FinancialAgent {
    private model: any;
    private analyticsService: AnalyticsService;

    constructor() {
        // 1. Initialize Google AI Client
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        
        // 2. Use the specific model you confirmed works
        this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // 3. Initialize the Analytics Service
        this.analyticsService = new AnalyticsService();
    }
    
    /**
     * Main method to analyze financial data using AI
     */
    async analyzeSpending(transactions: ITransaction[]): Promise<string> {
        try {
            // Step A: Calculate the Financial Health Score (Math Layer)
            // We use "demo_user" for this MVP. In a real app, pass the actual userId.
            const healthScore = await this.analyticsService.calculateHealthScore("demo_user");

            // Step B: Summarize the transaction data (Data Layer)
            const summary = this.summarizeTransactions(transactions);
            
            // Step C: Construct the "Super Prompt" (AI Layer)
            const prompt = `
            ${FINANCIAL_ADVISOR_PROMPT}
            
            -------------------------------------------------------------
            CONTEXT:
            The user's Calculated Financial Health Score is: ${healthScore} / 100.
            (Scale: 0-39 = Critical, 40-69 = Needs Improvement, 70-100 = Healthy).
            -------------------------------------------------------------
            
            TRANSACTION SUMMARY:
            ${JSON.stringify(summary, null, 2)}

            INSTRUCTIONS:
            1. Start by acknowledging their Financial Health Score.
            2. If the score is low (<50), explain WHY based on the data (e.g., high debt, low savings).
            3. If the score is high (>70), congratulate them.
            4. Provide actionable advice to improve the score.
            `;

            // Step D: Send to Gemini
            return await this.callLLM(prompt);

        } catch (error) {
            console.error("Error in analyzeSpending flow:", error);
            return "I am currently unable to analyze your finances. Please try again later.";
        }
    }

    /**
     * Helper to aggregate raw transactions into a summary for the AI
     * (Saves tokens and improves AI accuracy)
     */
    private summarizeTransactions(transactions: ITransaction[]) {
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals: Record<string, number> = {};

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
                // Aggregate by category
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            }
        });

        return {
            period: "Recent Activity",
            total_income: totalIncome,
            total_expense: totalExpense,
            net_savings: totalIncome - totalExpense,
            spending_by_category: categoryTotals
        };
    }

    /**
     * Helper to handle the actual API network call
     */
    private async callLLM(prompt: string): Promise<string> {
        try {
            console.log("AI Agent is connecting to Gemini (gemini-2.5-flash)...");
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
            
        } catch (error: any) {
            console.error(" AI Error:", error);
            return `AI Connection Failed. Error Details: ${error.message}`;
        }
    }
}