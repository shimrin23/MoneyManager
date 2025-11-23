import request from 'supertest';
import app from '../../src/server'; // Adjust the import based on your server setup
import { mockBankingAPI } from '../mocks/bankingAPI.mock'; // Mocking external banking API

describe('Banking Integration Tests', () => {
    beforeAll(() => {
        // Setup mock for external banking API
        mockBankingAPI();
    });

    afterAll(() => {
        // Cleanup if necessary
    });

    it('should fetch account details successfully', async () => {
        const response = await request(app).get('/api/banking/account-details');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accountId');
        expect(response.body).toHaveProperty('balance');
    });

    it('should perform a transaction successfully', async () => {
        const transactionData = {
            amount: 100,
            type: 'debit',
            description: 'Test Transaction'
        };
        const response = await request(app).post('/api/banking/transactions').send(transactionData);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transactionId');
    });

    it('should handle errors when fetching account details', async () => {
        // Simulate an error from the banking API
        const response = await request(app).get('/api/banking/account-details?simulateError=true');
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
    });
});