import { Request, Response } from 'express';
import TransactionsService from '../services/transactions.service';
import { FinancialAgent } from '../ai/agent'; // Import the agent
import { BankingIntegration } from '../integrations/banking.integration'; // Import this
import { AnalyticsService } from '../services/analytics.service'; // Ensure this is imported

export default class TransactionsController {
    private transactionsService: TransactionsService;
    private analyticsService: AnalyticsService; // Add this

    constructor() {
        this.transactionsService = new TransactionsService();
        this.analyticsService = new AnalyticsService(); // Initialize
    }

    // POST /api/transactions
    async createTransaction(req: Request, res: Response) {
        try {
            const transactionData = req.body;
            
            // Basic validation
            if (!transactionData.amount || !transactionData.category) {
                return res.status(400).json({ error: 'Amount and Category are required' });
            }

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
    async getAllTransactions(req: Request, res: Response) {
        try {
            const transactions = await this.transactionsService.findAll();
            
            res.json({ 
                message: 'Transactions list', 
                count: transactions.length, 
                data: transactions 
            });
        } catch (error) {
            res.status(500).json({ error: 'Could not fetch transactions' });
        }
    }

    // GET /api/transactions/analysis
    async getFinancialAnalysis(req: Request, res: Response) {
        try {
            // 1. Get recent transactions
            const transactions = await this.transactionsService.findAll();
            
            if (transactions.length === 0) {
                return res.json({ message: "Not enough data for AI analysis yet." });
            }

            // 2. Ask the AI Agent to analyze them
            const agent = new FinancialAgent();
            const analysis = await agent.analyzeSpending(transactions);

            res.json({ 
                message: 'Analysis complete', 
                ai_insight: analysis 
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'AI Analysis failed' });
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
    async getHealthScore(req: Request, res: Response) {
        try {
            // Calculate (or fetch cached) score for demo_user
            const score = await this.analyticsService.calculateHealthScore("demo_user");
            res.json({ score });
        } catch (error) {
            res.status(500).json({ error: 'Failed to calculate score' });
        }
    }
    // ---------------------------

    // GET /api/transactions/subscriptions
    async getSubscriptions(req: Request, res: Response) {
        try {
            const subs = await this.analyticsService.getSubscriptions();
            res.json({ subscriptions: subs });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch subscriptions' });
        }
    }
}