import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import TransactionsService from '../services/transactions.service';
import { FinancialAgent } from '../ai/agent'; // Import the agent
import { BankingIntegration } from '../integrations/banking.integration'; // Import this
import { AnalyticsService } from '../services/analytics.service'; // Ensure this is imported
import { FinancialHealthService } from '../services/financial-health.service';

export default class TransactionsController {
    private transactionsService: TransactionsService;
    private analyticsService: AnalyticsService; // Add this
    private financialHealthService: FinancialHealthService;

    constructor() {
        this.transactionsService = new TransactionsService();
        this.analyticsService = new AnalyticsService(); // Initialize
        this.financialHealthService = new FinancialHealthService();
    }

    // POST /api/transactions
    async createTransaction(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const transactionData = req.body;
            
            // Basic validation
            if (!transactionData.amount || !transactionData.category) {
                return res.status(400).json({ error: 'Amount and Category are required' });
            }

            // Add userId to transaction data
            transactionData.userId = userId;

            // call the service to save to MongoDB
            const newTransaction = await this.transactionsService.create(transactionData);
            
            res.status(201).json({ 
                message: 'Transaction created successfully', 
                data: newTransaction 
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // GET /api/transactions/:id
    async getTransaction(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const transaction = await this.transactionsService.findById(id);
            
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            res.json({ message: 'Transaction found', data: transaction });
        } catch (error) {
            res.status(500).json({ error: 'Error retrieving transaction' });
        }
    }

    // PUT /api/transactions/:id
    async updateTransaction(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const updatedTransaction = await this.transactionsService.update(id, updates);
            
            if (!updatedTransaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }

            res.json({ message: 'Transaction updated', data: updatedTransaction });
        } catch (error) {
            res.status(500).json({ error: 'Could not update transaction' });
        }
    }

    // DELETE /api/transactions/:id
    async deleteTransaction(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await this.transactionsService.delete(id);

            if (!deleted) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            
            res.status(200).json({ message: 'Transaction deleted' });
        } catch (error) {
            res.status(500).json({ error: 'Could not delete transaction' });
        }
    }

    // GET /api/transactions
    async getAllTransactions(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const transactions = await this.transactionsService.getAll(userId);
            
            res.json({ 
                message: 'Transactions list', 
                count: transactions.length, 
                data: transactions 
            });
        } catch (error) {
            res.status(500).json({ error: 'Could not fetch transactions' });
        }
    }

    // GET /api/transactions/analysis - AI-powered financial analysis
    async getFinancialAnalysis(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Get AI-powered analysis
            const analysis = await this.financialHealthService.getAIAnalysis(userId);
            res.json({ analysis });
        } catch (error) {
            console.error('Error getting AI analysis:', error);
            res.status(500).json({ error: 'Failed to generate AI analysis' });
        }
    }

    // POST /api/transactions/sync
    async syncBankAccount(req: Request, res: Response) {
        try {
            const bank = new BankingIntegration();
            const newTransactions = await bank.fetchRecentTransactions();

            // Save each transaction to the database using your existing Service
            const savedTransactions = [];
            for (const data of newTransactions) {
                const saved = await this.transactionsService.create(data);
                savedTransactions.push(saved);
            }

            res.json({ 
                message: 'Sync complete', 
                transactions_added: savedTransactions.length,
                data: savedTransactions
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Bank sync failed' });
        }
    }

    // --- ADD THIS NEW METHOD ---
    // GET /api/transactions/score
    async getHealthScore(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Use enhanced financial health service
            const healthData = await this.financialHealthService.getHealthReport(userId);
            res.json(healthData);
        } catch (error) {
            console.error('Error getting health score:', error);
            res.status(500).json({ error: 'Failed to calculate health score' });
        }
    }
    // ---------------------------

    // GET /api/transactions/subscriptions
    async getSubscriptions(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const subs = await this.analyticsService.getSubscriptions(userId);
            res.json({ subscriptions: subs });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch subscriptions' });
        }
    }

    // POST /api/transactions/ai-research - AI-powered research assistant
    async getAIResearch(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            const { question } = req.body;
            if (!question) {
                return res.status(400).json({ error: 'Question is required' });
            }

            // Initialize AI agent for research
            const financialAgent = new FinancialAgent();
            
            // Get user's transaction context for personalized research
            const userTransactions = await this.transactionsService.getAll(userId);
            
            // Create research prompt
            const researchPrompt = `
            You are a concise financial coach. Your answers must be brief, smart, and strictly formatted using bullet points. Do not write long paragraphs. Do not use markdown headers like '##'. Focus on actionable insights. Limit your response to a maximum of 3-4 key points.
            
            Question: ${question}
            
            User Context: The user has ${userTransactions.length} transactions on record.
            
            STRICT FORMAT REQUIREMENTS:
            • Point 1: [direct answer to the question]
            • Point 2: [key supporting information or insight]
            • Point 3: [specific actionable recommendation]
            • Point 4: [optional - only if absolutely critical]
            
            Keep each point under 25 words. Be specific and actionable. No markdown headers.
            `;

            // Use AI to generate research response
            const research = await financialAgent.generateResearch(researchPrompt);
            
            res.json({ 
                question,
                research,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error generating AI research:', error);
            res.status(500).json({ error: 'Failed to generate AI research response' });
        }
    }
}