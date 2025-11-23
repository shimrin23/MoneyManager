import { Router } from 'express';
import TransactionsController from "../controllers/transactions.controller";

const router = Router();
const transactionsController = new TransactionsController();

// Base path is already /api/transactions defined in index.ts

// POST /api/transactions
router.post('/', transactionsController.createTransaction.bind(transactionsController));

// GET /api/transactions
router.get('/', transactionsController.getAllTransactions.bind(transactionsController));

// GET /api/transactions/analysis
router.get('/analysis', transactionsController.getFinancialAnalysis.bind(transactionsController));

// POST /api/transactions/sync
router.post('/sync', transactionsController.syncBankAccount.bind(transactionsController));

// GET /api/transactions/:id
router.get('/:id', transactionsController.getTransaction.bind(transactionsController));

// PUT /api/transactions/:id
router.put('/:id', transactionsController.updateTransaction.bind(transactionsController));

// DELETE /api/transactions/:id
router.delete('/:id', transactionsController.deleteTransaction.bind(transactionsController));

export default router;