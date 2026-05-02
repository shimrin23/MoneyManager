import { GoogleGenerativeAI } from "@google/generative-ai";
import { ITransaction } from '../schemas/transaction.schema';
import { FINANCIAL_ADVISOR_PROMPT } from './prompts';
import { AnalyticsService } from '../services/analytics.service';
import dotenv from 'dotenv';

dotenv.config();

function isPlaceholderGeminiKey(apiKey: string): boolean {
    const normalizedKey = apiKey.trim().toLowerCase();
    return (
        normalizedKey.length === 0 ||
        normalizedKey.startsWith('your_') ||
        normalizedKey.includes('api_key_here') ||
        normalizedKey.includes('gemini_api_key_here')
    );
}

export class FinancialAgent {
    private model: any;
    private analyticsService: AnalyticsService;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || "";

        if (isPlaceholderGeminiKey(apiKey)) {
            throw new Error(
                "GEMINI_API_KEY is missing or still set to a placeholder. Add a valid Gemini API key to ai-pfm-backend/.env and restart the backend.",
            );
        }

        // 1. Initialize Google AI Client
        const genAI = new GoogleGenerativeAI(apiKey);

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
            FINANCIAL HEALTH SCORE: ${healthScore}/100
            (Scale: 0-39 = Critical, 40-69 = Needs Improvement, 70-100 = Healthy)
            -------------------------------------------------------------
            
            TRANSACTION SUMMARY:
            ${JSON.stringify(summary, null, 2)}

            STRICT INSTRUCTIONS:
            1. Give me exactly 3-4 bullet points maximum
            2. Use • symbol for each point
            3. No long paragraphs - keep each point under 25 words
            4. Focus only on the most critical insights
            5. Be specific and actionable
            6. Do not use markdown headers (##, ###, etc.)
            `;

            // Step D: Send to Gemini
            return await this.callLLM(prompt);

        } catch (error) {
            console.error("Error in analyzeSpending flow:", error);
            return "I am currently unable to analyze your finances. Please try again later.";
        }
    }

    /**
     * Public method for general AI research and financial questions
     */
    async generateResearch(prompt: string): Promise<string> {
        try {
            console.log("🔬 AI Research Mode - Connecting to Gemini...");
            return await this.callLLM(prompt);
        } catch (error) {
            console.error("Research AI Error:", error);
            return "I'm currently unable to provide research assistance. Please try again later.";
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

            if (error?.message?.includes("API key not valid") || error?.message?.includes("API_KEY_INVALID")) {
                return "Gemini rejected the API key. Check ai-pfm-backend/.env and set GEMINI_API_KEY to a valid Google Gemini key, then restart the backend.";
            }

            return `AI Connection Failed. Error Details: ${error.message}`;
        }
    }
}