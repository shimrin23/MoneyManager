import { GoogleGenerativeAI } from "@google/generative-ai";
import { ITransaction } from '../schemas/transaction.schema';
import { FINANCIAL_ADVISOR_PROMPT } from './prompts';
import dotenv from 'dotenv';

dotenv.config();

export class FinancialAgent {
    private model: any;

    constructor() {
        // Initialize Gemini with the API Key from .env
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
        // TRY THIS EXACT STRING:
        this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });    }
    
    async analyzeSpending(transactions: ITransaction[]): Promise<string> {
        // 1. Summarize data to keep it clean for the AI and save tokens
        const summary = this.summarizeTransactions(transactions);
        
        // 2. Construct the prompt with the summarized data
        const prompt = `
        ${FINANCIAL_ADVISOR_PROMPT}
        
        Here is the transaction summary data:
        ${JSON.stringify(summary, null, 2)}
        `;

        // 3. Call the Real AI
        return this.callLLM(prompt);
    }

    private summarizeTransactions(transactions: ITransaction[]) {
        // Calculate totals
        let totalIncome = 0;
        let totalExpense = 0;
        const categoryTotals: Record<string, number> = {};

        transactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            } else {
                totalExpense += t.amount;
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

    private async callLLM(prompt: string): Promise<string> {
        try {
            console.log(" AI Agent is connecting to Gemini...");
            
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return text;

        } catch (error: any) {
            console.error("AI Error:", error);
            
            // Return the ACTUAL error message to the user/curl for easier debugging
            return `AI Connection Failed. Error Details: ${error.message}`;
        }
    }
}