import TransactionsService from '../../src/services/transactions.service';

describe('TransactionsService', () => {
    let service: TransactionsService;

    beforeEach(() => {
        service = new TransactionsService();
    });

    it('should create a transaction', async () => {
        const transactionData = { amount: 100, description: 'Test transaction' };
        const result = await service.create(transactionData);
        expect(result).toHaveProperty('amount');
    });

    it('should retrieve all transactions', async () => {
        const results = await service.findAll();
        expect(Array.isArray(results)).toBe(true);
    });

    it('should have methods defined', () => {
        expect(typeof service.create).toBe('function');
        expect(typeof service.findAll).toBe('function');
        expect(typeof service.delete).toBe('function');
    });
});