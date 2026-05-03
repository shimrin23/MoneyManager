// Enhanced Banking Integration Service
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import Transaction from '../schemas/transaction.schema';
import Alert, { IAlert } from '../schemas/alert.schema';
import { FinancialAgent } from '../ai/agent';

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

    private readonly MERCHANT_NORMALIZATION: Record<string, string> = this.loadMerchantNormalization();

    private loadMerchantNormalization(): Record<string, string> {
        try {
            const cfgPath = path.join(__dirname, '..', 'config', 'merchant-normalization.json');
            if (fs.existsSync(cfgPath)) {
                const raw = fs.readFileSync(cfgPath, 'utf8');
                const parsed = JSON.parse(raw);
                const normalized: Record<string, string> = {};
                for (const [k, v] of Object.entries(parsed)) {
                    normalized[String(k).toUpperCase()] = String(v);
                }
                return normalized;
            }
        } catch (e) {
            // ignore and fall back
        }

        return {
            'UBER': 'Uber',
            'UBER LANKA': 'Uber',
            'NETFLIX': 'Netflix',
            'SPOTIFY': 'Spotify',
            'AMAZON': 'Amazon',
            'KEELLS': 'Keells Super'
        };
    }

    /**
     * Enhanced transaction categorization using MCC codes and merchant normalization
     */
    categorizeTransaction(transaction: any): {
        category: string;
        normalizedMerchant: string;
        isRecurring: boolean;
        recurringFrequency?:
            | "daily"
            | "weekly"
            | "biweekly"
            | "monthly"
            | "quarterly"
            | "yearly";
        recurringDueDate?: Date;
        confidence: number;
    } {
        const { mcc, merchantName, amount, description } = transaction;
        
        // 1. MCC-based categorization
        let category = this.MCC_CATEGORIES[mcc] || 'Other';
        
        // 2. Merchant normalization
        const normalizedMerchant = this.normalizeMerchant(merchantName);
        
        // 3. Recurring pattern detection (returns richer metadata)
        const recurringMeta = this.detectRecurringPattern(normalizedMerchant, amount, description);
        const isRecurring = !!recurringMeta?.isRecurring;
        
        // 4. Income detection
        if (this.isIncomeTransaction(description, amount)) {
            category = 'Income';
        }
        
        return {
            category,
            normalizedMerchant,
            isRecurring,
            recurringFrequency: recurringMeta?.frequency,
            recurringDueDate: recurringMeta?.nextDueDate,
            confidence: this.calculateCategoryConfidence(mcc, merchantName, description),
        };
    }

    /**
     * Async variant of categorizeTransaction: runs rule-based enrichment first,
     * then falls back to AI (Gemini) when confidence is below 0.6 and no MCC matched.
     */
    async categorizeTransactionAsync(transaction: any): Promise<ReturnType<EnhancedBankingIntegration['categorizeTransaction']>> {
        const result = this.categorizeTransaction(transaction);
        if (result.confidence >= 0.6 || this.MCC_CATEGORIES[transaction.mcc]) {
            return result;
        }
        try {
            const agent = new FinancialAgent();
            const aiResult = await agent.categorizeTransaction(
                transaction.description || '',
                transaction.merchantName || '',
            );
            if (aiResult && aiResult.confidence > result.confidence) {
                return { ...result, category: aiResult.category, confidence: aiResult.confidence };
            }
        } catch {
            // no Gemini key or network error — fall through to rule-based result
        }
        return result;
    }

    /**
     * Compute anomaly score for a transaction based on z-score against the user's
     * recent spending in the same category. Requires at least 5 historical records.
     */
    async computeAnomalyForTransaction(userId: string, amount: number, category: string): Promise<{ isAnomaly: boolean; anomalyScore: number }> {
        try {
            const recent = await Transaction.find(
                { userId, category, type: 'expense' },
            ).sort({ date: -1 }).limit(50).lean() as any[];

            if (!recent || recent.length < 5) return { isAnomaly: false, anomalyScore: 0 };

            const amounts = recent.map((t: any) => Math.abs(t.amount || 0));
            const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
            const variance = amounts.reduce((s, a) => s + (a - avg) ** 2, 0) / amounts.length;
            const std = Math.sqrt(variance);

            if (std === 0) return { isAnomaly: false, anomalyScore: 0 };

            const z = Math.abs((Math.abs(amount) - avg) / std);
            const anomalyScore = Number(Math.min(z / 5, 1).toFixed(3));
            return { isAnomaly: z > 2.5, anomalyScore };
        } catch {
            return { isAnomaly: false, anomalyScore: 0 };
        }
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

    private detectRecurringPattern(merchant: string, amount: number, description?: string): {
        isRecurring: boolean;
        frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
        nextDueDate?: Date;
    } {
        if (!merchant && !description) return { isRecurring: false };

        const upperMerchant = (merchant || '').toUpperCase();
        const upperDesc = (description || '').toUpperCase();

        // Known subscription / recurring service keywords
        const subscriptionKeywords = ['NETFLIX', 'SPOTIFY', 'AMAZON PRIME', 'ZOOM', 'OFFICE 365', 'HULU', 'DISNEY', 'APPLE MUSIC', 'GOOGLE PLAY', 'MICROSOFT'];

        // Generic recurring indicators often seen in merchant descriptions
        const recurringIndicators = ['SUBSCRIPTION', 'SUBS', 'AUTOPAY', 'RECURR', 'MONTHLY', 'ANNUAL', 'MEMBERSHIP', 'INSTALLMENT', 'RENT', 'BILL', 'SVC', 'SERVICE'];

        // Frequency keywords
        const monthlyKeywords = ['MONTHLY', 'MONTH'];
        const weeklyKeywords = ['WEEKLY', 'WEEK'];
        const yearlyKeywords = ['YEARLY', 'ANNUAL', 'YEAR'];

        let isRecurring = false;
        let frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | undefined;

        if (subscriptionKeywords.some(k => upperMerchant.includes(k) || upperDesc.includes(k))) {
            isRecurring = true;
        }

        if (recurringIndicators.some(k => upperMerchant.includes(k) || upperDesc.includes(k))) {
            isRecurring = true;
        }

        if (monthlyKeywords.some(k => upperMerchant.includes(k) || upperDesc.includes(k))) frequency = 'monthly';
        else if (weeklyKeywords.some(k => upperMerchant.includes(k) || upperDesc.includes(k))) frequency = 'weekly';
        else if (yearlyKeywords.some(k => upperMerchant.includes(k) || upperDesc.includes(k))) frequency = 'yearly';

        // Amount heuristic: subscriptions often end with .99 or round numbers
        if (!isRecurring && amount && Math.abs(amount) > 0 && Math.abs(amount) < 50000) {
            const cents = Math.round((Math.abs(amount) - Math.floor(Math.abs(amount))) * 100);
            if (cents === 0 || cents === 99) {
                isRecurring = true;
                if (!frequency) frequency = 'monthly'; // default guess
            }
        }

        if (!isRecurring) return { isRecurring: false };

        // Compute a simple next due date heuristic based on frequency
        let nextDueDate: Date | undefined;
        const now = new Date();
        if (frequency === 'monthly') {
            nextDueDate = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        } else if (frequency === 'weekly') {
            nextDueDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else if (frequency === 'yearly') {
            nextDueDate = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
        }

        return { isRecurring, frequency, nextDueDate };
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
        if (merchant && this.MERCHANT_NORMALIZATION[merchant.toUpperCase()]) confidence += 0.2;
        
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

    /**
     * Infer recurrence frequency and next due date from historical transactions
     */
    async inferRecurrenceFromHistory(userId: string, merchant: string, amount: number): Promise<{
        frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
        nextDueDate?: Date;
    } | null> {
        if (!userId || !merchant) return null;

        try {
            // Find recent transactions for this user and merchant
            const candidates = await Transaction.find({
                userId,
                $or: [{ normalizedMerchant: merchant }, { merchantName: { $regex: merchant, $options: 'i' } }],
            })
                .sort({ date: -1 })
                .limit(50)
                .lean();

            if (!candidates || candidates.length < 2) return null;

            // Use amounts and dates to filter similar transactions
            const similar = candidates.filter((t: any) => {
                if (!t || typeof t.amount !== 'number') return false;
                // amount similarity within 30%
                const a = Math.abs(t.amount || 0);
                const delta = Math.abs(a - Math.abs(amount || 0));
                if (Math.max(a, Math.abs(amount || 0)) === 0) return false;
                return delta / Math.max(a, Math.abs(amount || 0)) <= 0.3;
            });

            if (similar.length < 2) return null;

            // Extract dates and compute day differences
            const dates = similar
                .map((t: any) => new Date(t.date))
                .filter((d: Date) => !isNaN(d.getTime()))
                .sort((a: Date, b: Date) => a.getTime() - b.getTime());

            if (dates.length < 2) return null;

            const diffs: number[] = [];
            for (let i = 1; i < dates.length; i++) {
                const d = Math.round((dates[i].getTime() - dates[i - 1].getTime()) / (24 * 3600 * 1000));
                if (d > 0) diffs.push(d);
            }

            if (diffs.length === 0) return null;

            // Median diff
            diffs.sort((a, b) => a - b);
            const mid = Math.floor(diffs.length / 2);
            const median = diffs.length % 2 === 1 ? diffs[mid] : Math.round((diffs[mid - 1] + diffs[mid]) / 2);

            let frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly' | undefined;
            if (median <= 3) frequency = 'daily';
            else if (median <= 10) frequency = 'weekly';
            else if (median <= 20) frequency = 'biweekly';
            else if (median <= 45) frequency = 'monthly';
            else if (median <= 150) frequency = 'quarterly';
            else frequency = 'yearly';

            const lastDate = dates[dates.length - 1];
            const nextDueDate = new Date(lastDate.getTime() + Math.round(median) * 24 * 3600 * 1000);

            return { frequency, nextDueDate };
        } catch (e) {
            return null;
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

    async triggerRealTimeAlert(transaction: any): Promise<void> {
        try {
            const type: IAlert['type'] =
                transaction.type === 'overdue_payment' ? 'overdue'
                : transaction.type === 'overlimit'     ? 'overlimit'
                :                                        'high_value';

            const message =
                type === 'overdue'   ? `Overdue payment of ${transaction.amount} detected`
                : type === 'overlimit' ? `Over-limit transaction of ${transaction.amount} detected`
                :                        `High-value transaction of ${transaction.amount} detected`;

            await Alert.create({
                userId: transaction.userId,
                type,
                message,
                amount: transaction.amount,
                transactionId: transaction.id || transaction.transactionId || transaction.externalTransactionId,
            });
        } catch (e) {
            console.error('[EnhancedBankingIntegration] Failed to persist real-time alert:', (e as any)?.message || e);
        }
    }
}