// Enhanced Banking Integration Service
import axios from 'axios';
import Transaction from '../schemas/transaction.schema';

export class EnhancedBankingIntegration {
    private readonly MCC_CATEGORIES: Record<string, string> = {
        '5411': 'Groceries',
        '5812': 'Dining',
        '4814': 'Telecom',
        '5814': 'Entertainment',
        '5542': 'Fuel',
        '5999': 'Utilities',
        '6011': 'ATM/Cash',
        '4121': 'Transport'
    };

    private readonly MERCHANT_NORMALIZATION: Record<string, string> = {
        'UBER': 'Uber',
        'UBER LANKA': 'Uber',
        'NETFLIX': 'Netflix',
        'SPOTIFY': 'Spotify',
        'AMAZON': 'Amazon',
        'KEELLS': 'Keells Super'
    };

    /**
     * Enhanced transaction categorization using MCC codes and merchant normalization
     */
    categorizeTransaction(transaction: any): {
        category: string;
        normalizedMerchant: string;
        isRecurring: boolean;
        confidence: number;
    } {
        const { mcc, merchantName, amount, description } = transaction;
        
        // 1. MCC-based categorization
        let category = this.MCC_CATEGORIES[mcc] || 'Other';
        
        // 2. Merchant normalization
        const normalizedMerchant = this.normalizeMerchant(merchantName);
        
        // 3. Recurring pattern detection
        const isRecurring = this.detectRecurringPattern(normalizedMerchant, amount);
        
        // 4. Income detection
        if (this.isIncomeTransaction(description, amount)) {
            category = 'Income';
        }
        
        return {
            category,
            normalizedMerchant,
            isRecurring,
            confidence: this.calculateCategoryConfidence(mcc, merchantName, description)
        };
    }

    private normalizeMerchant(merchantName: string): string {
        const upperMerchant = merchantName.toUpperCase();
        for (const [pattern, normalized] of Object.entries(this.MERCHANT_NORMALIZATION)) {
            if (upperMerchant.includes(pattern)) {
                return normalized;
            }
        }
        return merchantName;
    }

    private detectRecurringPattern(merchant: string, amount: number): boolean {
        // Check against known subscription services
        const subscriptionKeywords = ['NETFLIX', 'SPOTIFY', 'AMAZON PRIME', 'ZOOM', 'OFFICE 365'];
        return subscriptionKeywords.some(keyword => 
            merchant.toUpperCase().includes(keyword)
        );
    }

    private isIncomeTransaction(description: string, amount: number): boolean {
        const incomeKeywords = ['SALARY', 'WAGE', 'FREELANCE', 'DEPOSIT', 'TRANSFER IN', 'DIVIDEND'];
        return incomeKeywords.some(keyword => 
            description.toUpperCase().includes(keyword)
        ) && amount > 0;
    }

    private calculateCategoryConfidence(mcc: string, merchant: string, description: string): number {
        let confidence = 0.5; // Base confidence
        
        if (this.MCC_CATEGORIES[mcc]) confidence += 0.3;
        if (this.MERCHANT_NORMALIZATION[merchant.toUpperCase()]) confidence += 0.2;
        
        return Math.min(confidence, 1.0);
    }

    /**
     * Real-time transaction ingestion for large amounts or important events
     */
    async processRealTimeTransaction(transaction: any): Promise<void> {
        const THRESHOLD_AMOUNT = 50000; // LKR 50,000
        
        if (transaction.amount > THRESHOLD_AMOUNT || 
            transaction.type === 'overdue_payment' || 
            transaction.type === 'overlimit') {
            
            // Immediate processing for high-priority transactions
            await this.saveTransactionWithEnrichment(transaction);
            
            // Trigger real-time notifications
            await this.triggerRealTimeAlert(transaction);
        }
    }

    private async saveTransactionWithEnrichment(transaction: any): Promise<void> {
        const enriched = this.categorizeTransaction(transaction);
        
        const newTransaction = new Transaction({
            ...transaction,
            category: enriched.category,
            normalizedMerchant: enriched.normalizedMerchant,
            isRecurring: enriched.isRecurring,
            categoryConfidence: enriched.confidence,
            processedAt: new Date()
        });
        
        await newTransaction.save();
    }

    private async triggerRealTimeAlert(transaction: any): Promise<void> {
        // Implementation for real-time alerts
        console.log(`High-priority transaction detected: ${transaction.amount}`);
    }
}