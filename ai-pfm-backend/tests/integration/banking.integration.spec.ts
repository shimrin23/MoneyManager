import request from 'supertest';
import app from '../../src/index'; // Use Express app exported from index
import { mockBankingAPI } from '../mocks/bankingAPI.mock'; // Mocking external banking API

describe.skip('Banking Integration Tests', () => {
    beforeAll(() => {
        // Setup mock for external banking API
        mockBankingAPI();
    });

    afterAll(() => {
        // Cleanup if necessary
    });

    it('should fetch account details successfully (authenticated)', async () => {
        // Create and login a test user to obtain a token
        const email = `bank.${Date.now()}@example.com`;
        const password = 'Test@1234';

        const signup = await request(app).post('/api/auth/signup').send({ name: 'Bank Tester', email, password });
        expect(signup.status).toBe(201);

        const login = await request(app).post('/api/auth/login').send({ email, password });
        expect(login.status).toBe(200);
        const token = login.body.token;

        const response = await request(app).get('/api/banking/account-details').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('accountId');
        expect(response.body).toHaveProperty('balance');
    });

    it('should perform a transaction successfully (authenticated)', async () => {
        const email = `bank2.${Date.now()}@example.com`;
        const password = 'Test@1234';
        await request(app).post('/api/auth/signup').send({ name: 'Bank Tester', email, password });
        const login = await request(app).post('/api/auth/login').send({ email, password });
        const token = login.body.token;

        const transactionData = {
            amount: 100,
            type: 'debit',
            description: 'Test Transaction'
        };
        const response = await request(app).post('/api/banking/transactions').set('Authorization', `Bearer ${token}`).send(transactionData);
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('transactionId');
    });

    it('should handle errors when fetching account details (authenticated)', async () => {
        const email = `bank3.${Date.now()}@example.com`;
        const password = 'Test@1234';
        await request(app).post('/api/auth/signup').send({ name: 'Bank Tester', email, password });
        const login = await request(app).post('/api/auth/login').send({ email, password });
        const token = login.body.token;

        const response = await request(app).get('/api/banking/account-details?simulateError=true').set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('error');
    });
});