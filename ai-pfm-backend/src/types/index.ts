export type Transaction = {
    id: string;
    amount: number;
    date: Date;
    description: string;
    category: string;
    userId: string;
};

export type User = {
    id: string;
    name: string;
    email: string;
    preferences: {
        currency: string;
        notifications: boolean;
    };
};

export type FinancialData = {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    transactions: Transaction[];
};

export interface AIRecommendation {
    suggestion: string;
    confidence: number;
}