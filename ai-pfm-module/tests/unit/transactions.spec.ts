import { TransactionsController } from '../../src/controllers/transactions.controller';
import { TransactionsService } from '../../src/services/transactions.service';

describe('TransactionsController', () => {
    let transactionsController: TransactionsController;
    let transactionsService: TransactionsService;

    beforeEach(() => {
        transactionsService = new TransactionsService();
        transactionsController = new TransactionsController(transactionsService);
    });

    it('should create a transaction', async () => {
        const transactionData = { amount: 100, description: 'Test transaction' };
        jest.spyOn(transactionsService, 'createTransaction').mockResolvedValue(transactionData);

        const result = await transactionsController.createTransaction(transactionData);
        expect(result).toEqual(transactionData);
    });

    it('should retrieve a transaction by ID', async () => {
        const transactionId = '1';
        const transactionData = { id: transactionId, amount: 100, description: 'Test transaction' };
        jest.spyOn(transactionsService, 'getTransactionById').mockResolvedValue(transactionData);

        const result = await transactionsController.getTransactionById(transactionId);
        expect(result).toEqual(transactionData);
    });

    it('should update a transaction', async () => {
        const transactionId = '1';
        const updatedData = { amount: 150, description: 'Updated transaction' };
        jest.spyOn(transactionsService, 'updateTransaction').mockResolvedValue(updatedData);

        const result = await transactionsController.updateTransaction(transactionId, updatedData);
        expect(result).toEqual(updatedData);
    });

    it('should delete a transaction', async () => {
        const transactionId = '1';
        jest.spyOn(transactionsService, 'deleteTransaction').mockResolvedValue(true);

        const result = await transactionsController.deleteTransaction(transactionId);
        expect(result).toBe(true);
    });
});