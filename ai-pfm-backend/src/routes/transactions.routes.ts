import { Router } from 'express';
import TransactionsController from "../controllers/transactions.controller";
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();
const transactionsController = new TransactionsController();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Base path is already /api/transactions defined in index.ts

// POST /api/transactions
router.post('/', transactionsController.createTransaction.bind(transactionsController));

// GET /api/transactions/subscriptions
router.get('/subscriptions', transactionsController.getSubscriptions.bind(transactionsController));

// GET /api/transactions
router.get('/', transactionsController.getAllTransactions.bind(transactionsController));

// GET /api/transactions/analysis
router.get('/analysis', transactionsController.getFinancialAnalysis.bind(transactionsController));

// POST /api/transactions/ai-research
router.post('/ai-research', transactionsController.getAIResearch.bind(transactionsController));

// POST /api/transactions/sync
router.post('/sync', transactionsController.syncBankAccount.bind(transactionsController));

// GET /api/transactions/subscriptions
router.get('/subscriptions', transactionsController.getSubscriptions.bind(transactionsController));

// GET /api/transactions/:id
router.get('/:id', transactionsController.getTransaction.bind(transactionsController));

// PUT /api/transactions/:id
router.put('/:id', transactionsController.updateTransaction.bind(transactionsController));

// DELETE /api/transactions/:id
router.delete('/:id', transactionsController.deleteTransaction.bind(transactionsController));

router.get('/score', transactionsController.getHealthScore.bind(transactionsController));

export default router;