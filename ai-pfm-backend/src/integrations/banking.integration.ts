import axios from 'axios';
const BANK_API_BASE_URL = process.env.BANK_API_BASE_URL || 'https://api.fakebank.com';
const BANK_API_TIMEOUT_MS = Number(process.env.BANK_API_TIMEOUT_MS || 12000);
const BANK_API_MAX_RETRIES = Number(process.env.BANK_API_MAX_RETRIES || 3);
const BANK_API_BACKOFF_MS = Number(process.env.BANK_API_BACKOFF_MS || 500);

export const getBankingIntegrationRuntimeConfig = () => ({
    baseUrl: BANK_API_BASE_URL,
    mode: 'real',
    timeoutMs: BANK_API_TIMEOUT_MS,
    maxRetries: BANK_API_MAX_RETRIES,
    backoffBaseMs: BANK_API_BACKOFF_MS,
    fetchLimit: Number(process.env.BANK_API_FETCH_LIMIT || 250),
    tokenConfigured: Boolean(process.env.BANK_API_TOKEN),
});

type RetryableError = Error & {
    code?: string;
    response?: {
        status?: number;
        data?: any;
    };
};

export class BankingIntegrationError extends Error {
    code?: string;
    status?: number;
    retryable: boolean;
    attempts: number;
    context?: Record<string, unknown>;

    constructor(message: string, options?: {
        code?: string;
        status?: number;
        retryable?: boolean;
        attempts?: number;
        context?: Record<string, unknown>;
    }) {
        super(message);
        this.name = 'BankingIntegrationError';
        this.code = options?.code;
        this.status = options?.status;
        this.retryable = options?.retryable ?? false;
        this.attempts = options?.attempts ?? 1;
        this.context = options?.context;
    }
}

interface BankTransaction {
    id?: string;
    transactionId?: string;
    amount: number;
    mcc?: string;
    merchantId?: string;
    merchantName?: string;
    category?: string;
    description?: string;
    type?: 'income' | 'expense' | string;
    date: string;
    sourceAccount?: string;
}

export class BankingIntegration {
    private client = axios.create({
        baseURL: BANK_API_BASE_URL,
        timeout: BANK_API_TIMEOUT_MS,
        headers: {
            'Content-Type': 'application/json',
            ...(process.env.BANK_API_TOKEN
                ? { Authorization: `Bearer ${process.env.BANK_API_TOKEN}` }
                : {}),
        },
    });

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private isRetryable(error: RetryableError): boolean {
        const status = error.response?.status;
        if (status && [408, 409, 425, 429].includes(status)) return true;
        if (status && status >= 500) return true;

        const transientCodes = new Set([
            'ECONNABORTED',
            'ECONNRESET',
            'ENOTFOUND',
            'EAI_AGAIN',
            'ETIMEDOUT',
            'EHOSTUNREACH',
        ]);

        return !!(error.code && transientCodes.has(error.code));
    }

    private async requestWithRetry<T>(
        operation: string,
        context: Record<string, unknown>,
        requestFn: () => Promise<T>,
    ): Promise<T> {
        let attempt = 0;
        let lastError: RetryableError | undefined;

        while (attempt < BANK_API_MAX_RETRIES) {
            attempt += 1;
            const startedAt = Date.now();

            try {
                const result = await requestFn();
                const latencyMs = Date.now() - startedAt;

                console.info('[BankingIntegration] API success', {
                    operation,
                    attempt,
                    latencyMs,
                    context,
                });

                return result;
            } catch (error: any) {
                const err = error as RetryableError;
                const retryable = this.isRetryable(err);
                const latencyMs = Date.now() - startedAt;
                const status = err.response?.status;

                console.warn('[BankingIntegration] API failure', {
                    operation,
                    attempt,
                    maxAttempts: BANK_API_MAX_RETRIES,
                    retryable,
                    latencyMs,
                    status,
                    code: err.code,
                    message: err.message,
                    context,
                });

                lastError = err;

                if (!retryable || attempt >= BANK_API_MAX_RETRIES) {
                    break;
                }

                const backoffMs = BANK_API_BACKOFF_MS * Math.pow(2, attempt - 1);
                await this.sleep(backoffMs);
            }
        }

        throw new BankingIntegrationError(
            `Banking API call failed for ${operation}`,
            {
                code: lastError?.code,
                status: lastError?.response?.status,
                retryable: lastError ? this.isRetryable(lastError) : false,
                attempts: attempt,
                context,
            },
        );
    }



    async fetchAccountData(accountId: any) {
        try {
            const response = await this.requestWithRetry(
                'fetchAccountData',
                { accountId },
                async () => this.client.get(`/accounts/${accountId}`),
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Error fetching account data: ${error.message}`);
        }
    }

    async fetchTransactionHistory(accountId: any) {
        try {
            const response = await this.requestWithRetry(
                'fetchTransactionHistory',
                { accountId },
                async () => this.client.get(`/accounts/${accountId}/transactions`),
            );
            return Array.isArray(response.data) ? response.data : response.data?.transactions || [];
        } catch (error: any) {
            throw new Error(`Error fetching transaction history: ${error.message}`);
        }
    }

    async initiateTransaction(transactionData: any) {
        try {
            const response = await this.requestWithRetry(
                'initiateTransaction',
                { amount: transactionData?.amount, sourceAccount: transactionData?.sourceAccount },
                async () => this.client.post('/transactions', transactionData),
            );
            return response.data;
        } catch (error: any) {
            throw new Error(`Error initiating transaction: ${error.message}`);
        }
    }

    /**
     * Fetches recent transactions from the banking API.
     * NOTE: This is currently a mock implementation with filter support.
     */
    async fetchRecentTransactions(params?: {
        accountId?: string;
        since?: Date;
    }): Promise<any[]> {
        const accountId = params?.accountId || 'DEFAULT_ACCOUNT';
        const since = params?.since;
        const sinceISO = since?.toISOString();

        const response = await this.requestWithRetry(
            'fetchRecentTransactions',
            { accountId, since: sinceISO },
            async () =>
                this.client.get('/transactions/recent', {
                    params: {
                        accountId,
                        since: sinceISO,
                        limit: Number(process.env.BANK_API_FETCH_LIMIT || 250),
                    },
                }),
        );

        const transactions: BankTransaction[] = Array.isArray(response.data)
            ? response.data
            : response.data?.transactions || [];

        return transactions.map((txn) => ({
            ...txn,
            sourceAccount: txn.sourceAccount || accountId,
        }));
    }
}
