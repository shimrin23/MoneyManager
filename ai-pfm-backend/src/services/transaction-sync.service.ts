import { createHash } from "crypto";
import Transaction from "../schemas/transaction.schema";
import Subscription from "../schemas/subscription.schema";
import SyncState from "../schemas/sync_state.schema";
import User from "../schemas/user.schema";
import consentService from "./consent.service";
import { BankingIntegration, BankingIntegrationError } from "../integrations/banking.integration";
import { EnhancedBankingIntegration } from "./enhanced-banking.service";
import { createAuditLog } from "../middlewares/auditMiddleware";

interface SyncAccountResult {
  sourceAccount: string;
  processed: number;
  inserted: number;
  updated: number;
  status: "success" | "failed" | "skipped";
  error?: string;
}

export interface SyncUserResult {
  userId: string;
  status: "success" | "failed" | "skipped";
  consented: boolean;
  accounts: SyncAccountResult[];
}

export interface SyncBatchSummary {
  startedAt: string;
  endedAt: string;
  usersProcessed: number;
  usersSkipped: number;
  usersFailed: number;
  accountsProcessed: number;
  inserted: number;
  updated: number;
  failedAccounts: number;
  details: SyncUserResult[];
}

export const buildTransactionSyncKey = (input: {
  userId: string;
  sourceAccount: string;
  externalTransactionId?: string;
  amount: number;
  description?: string;
  merchantName?: string;
  date: Date;
}): string => {
  const externalId = input.externalTransactionId?.trim();
  if (externalId) {
    return `ext:${input.userId}:${input.sourceAccount}:${externalId}`;
  }

  const canonical = [
    input.userId,
    input.sourceAccount,
    Number(input.amount).toFixed(2),
    input.description || "",
    input.merchantName || "",
    input.date.toISOString(),
  ].join("|");

  const digest = createHash("sha256").update(canonical).digest("hex");
  return `hash:${digest}`;
};

export class TransactionSyncService {
  private bankingIntegration = new BankingIntegration();
  private enrichmentService = new EnhancedBankingIntegration();

  async syncAllConsentedUsers(): Promise<SyncBatchSummary> {
    const startedAt = new Date();
    const users = await User.find({}, { _id: 1 }).lean();

    const details: SyncUserResult[] = [];
    for (const user of users) {
      const userId = String(user._id);
      const result = await this.syncUser(userId);
      details.push(result);
    }

    const endedAt = new Date();
    return {
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      usersProcessed: details.filter((d) => d.status === "success").length,
      usersSkipped: details.filter((d) => d.status === "skipped").length,
      usersFailed: details.filter((d) => d.status === "failed").length,
      accountsProcessed: details.reduce((sum, d) => sum + d.accounts.length, 0),
      inserted: details
        .flatMap((d) => d.accounts)
        .reduce((sum, a) => sum + a.inserted, 0),
      updated: details
        .flatMap((d) => d.accounts)
        .reduce((sum, a) => sum + a.updated, 0),
      failedAccounts: details
        .flatMap((d) => d.accounts)
        .filter((a) => a.status === "failed").length,
      details,
    };
  }

  async syncUser(
    userId: string,
    options?: { sourceAccounts?: string[]; manualTrigger?: boolean },
  ): Promise<SyncUserResult> {
    const hasConsent = await consentService.canAnalyzeFinancialData(userId);
    if (!hasConsent) {
      return {
        userId,
        status: "skipped",
        consented: false,
        accounts: [],
      };
    }

    const accounts =
      options?.sourceAccounts && options.sourceAccounts.length > 0
        ? options.sourceAccounts
        : await this.getSourceAccountsForUser(userId);

    const results: SyncAccountResult[] = [];
    for (const accountId of accounts) {
      const result = await this.syncAccount(userId, accountId);
      results.push(result);
    }

    const hasFailures = results.some((r) => r.status === "failed");
    const status: SyncUserResult["status"] = hasFailures ? "failed" : "success";

    await createAuditLog(
      userId,
      {
        action: options?.manualTrigger
          ? "TRANSACTION_SYNC_MANUAL"
          : "TRANSACTION_SYNC_BATCH",
        resourceType: "transaction",
        severity: hasFailures ? "high" : "medium",
        metadata: {
          status,
          consented: true,
          accounts: results.length,
          failedAccounts: results.filter((r) => r.status === "failed").length,
        },
      },
      undefined,
      hasFailures ? "warning" : "success",
    );

    return {
      userId,
      status,
      consented: true,
      accounts: results,
    };
  }

  async getUserSyncStatus(userId: string) {
    return SyncState.find({ userId }).sort({ updatedAt: -1 }).lean();
  }

  private async getSourceAccountsForUser(userId: string): Promise<string[]> {
    const user = await User.findById(userId, { bankAccounts: 1 }).lean();
    const activeAccounts =
      user?.bankAccounts
        ?.filter((a) => a.isActive !== false)
        .map((a) => a.accountId)
        .filter(Boolean) || [];

    if (activeAccounts.length > 0) {
      return activeAccounts;
    }

    // Fallback: keeps MVP functional even before account-linking is completed.
    return ["DEFAULT_ACCOUNT"];
  }

  private async syncAccount(
    userId: string,
    sourceAccount: string,
  ): Promise<SyncAccountResult> {
    const startedAt = new Date();

    const state = await SyncState.findOneAndUpdate(
      { userId, sourceAccount },
      {
        $setOnInsert: {
          userId,
          sourceAccount,
          totalRuns: 0,
          successRuns: 0,
          failedRuns: 0,
          lastProcessedCount: 0,
          lastInsertedCount: 0,
          lastUpdatedCount: 0,
        },
        $set: {
          lastStatus: "running",
          lastRunStartedAt: startedAt,
          lastError: undefined,
        },
      },
      { upsert: true, new: true },
    );

    try {
      const bankTransactions = await this.bankingIntegration.fetchRecentTransactions({
        accountId: sourceAccount,
        since: state?.lastSyncedAt,
      });


      if (bankTransactions.length === 0) {
        await SyncState.updateOne(
          { userId, sourceAccount },
          {
            $set: {
              lastStatus: "success",
              lastRunEndedAt: new Date(),
              lastSyncedAt: new Date(),
              lastProcessedCount: 0,
              lastInsertedCount: 0,
              lastUpdatedCount: 0,
            },
            $inc: { totalRuns: 1, successRuns: 1 },
          },
        );

        return {
          sourceAccount,
          processed: 0,
          inserted: 0,
          updated: 0,
          status: "success",
        };
      }

      // Build operations asynchronously so we can call history inference
      const operations = await Promise.all(
        bankTransactions.map(async (rawTxn: any) => {
          const normalizedDate = new Date(rawTxn.date || Date.now());
          const amount = Number(rawTxn.amount || 0);
          const merchantName = String(rawTxn.merchantName || "");
          const description = String(rawTxn.description || "");
          const externalTransactionId = rawTxn.id || rawTxn.transactionId;
          const syncKey = buildTransactionSyncKey({
            userId,
            sourceAccount,
            externalTransactionId,
            amount,
            description,
            merchantName,
            date: normalizedDate,
          });

          const enriched = this.enrichmentService.categorizeTransaction({
            ...rawTxn,
            amount,
            description,
            merchantName,
          });

          // Try to refine recurrence using historical transactions for the user
          let histRecurrence: any = null;
          if (enriched.isRecurring) {
            try {
              histRecurrence = await this.enrichmentService.inferRecurrenceFromHistory(
                userId,
                enriched.normalizedMerchant || merchantName,
                amount,
              );
            } catch (e) {
              histRecurrence = null;
            }
          }

          const type =
            rawTxn.type === "income" || rawTxn.type === "expense"
              ? rawTxn.type
              : amount >= 0
                ? "income"
                : "expense";

          const updateDoc: any = {
            userId,
            syncKey,
            externalTransactionId,
            amount: Math.abs(amount),
            category: enriched.category || rawTxn.category || "Other",
            date: normalizedDate,
            description,
            type,
            mcc: rawTxn.mcc,
            merchantId: rawTxn.merchantId,
            merchantName,
            normalizedMerchant: enriched.normalizedMerchant,
            isRecurring: enriched.isRecurring,
            recurringFrequency: (histRecurrence && histRecurrence.frequency) || (enriched as any).recurringFrequency,
            recurringDueDate: (histRecurrence && histRecurrence.nextDueDate) || (enriched as any).recurringDueDate,
            categoryConfidence: enriched.confidence,
            sourceAccount,
            ingestionType: "batch",
            processedAt: new Date(),
          };

          return {
            updateOne: {
              filter: { userId, syncKey },
              update: {
                $set: updateDoc,
                $setOnInsert: { createdAt: new Date() },
              },
              upsert: true,
            },
          };
        }),
      );

      const bulkResult = await Transaction.bulkWrite(operations, { ordered: false });
      const inserted = bulkResult.upsertedCount || 0;
      const updated = (bulkResult.modifiedCount || 0) + (bulkResult.matchedCount || 0) - inserted;

      // Persist detected recurring subscriptions
      try {
        for (const op of operations) {
          const setDoc = op.updateOne.update.$set;
          if (setDoc && setDoc.isRecurring) {
            const provider = setDoc.normalizedMerchant || setDoc.merchantName || "Unknown";
                  console.info('[TransactionSyncService] persisting subscription', { userId: setDoc.userId, provider, isRecurring: setDoc.isRecurring });
            const amount = Math.abs(setDoc.amount || 0);
            // Map frequency to subscription schema enum (monthly/yearly)
            let freq: "monthly" | "yearly" = "monthly";
            const rf = setDoc.recurringFrequency;
            if (rf === "yearly") freq = "yearly";

            const nextPayment = setDoc.recurringDueDate ? new Date(setDoc.recurringDueDate) : undefined;

            await Subscription.findOneAndUpdate(
              { userId: setDoc.userId, provider },
              {
                $set: {
                  userId: setDoc.userId,
                  name: provider,
                  provider,
                  amount,
                  frequency: freq,
                  nextPayment: nextPayment || new Date(),
                  category: setDoc.category || "Other",
                  isActive: true,
                  lastUsed: setDoc.date || new Date(),
                },
              },
              { upsert: true, new: true },
            );
          }
        }
      } catch (e) {
        // non-fatal: log and continue
        console.warn('[TransactionSyncService] failed to persist subscription', (e as any)?.message || String(e));
      }

      await SyncState.updateOne(
        { userId, sourceAccount },
        {
          $set: {
            lastStatus: "success",
            lastRunEndedAt: new Date(),
            lastSyncedAt: new Date(),
            lastProcessedCount: bankTransactions.length,
            lastInsertedCount: inserted,
            lastUpdatedCount: Math.max(updated, 0),
          },
          $inc: { totalRuns: 1, successRuns: 1 },
        },
      );

      await createAuditLog(
        userId,
        {
          action: "TRANSACTION_SYNC_ACCOUNT_SUCCESS",
          resourceType: "transaction",
          severity: "low",
          metadata: {
            sourceAccount,
            processed: bankTransactions.length,
            inserted,
            updated: Math.max(updated, 0),
            durationMs: Date.now() - startedAt.getTime(),
          },
        },
        undefined,
        "success",
      );

      return {
        sourceAccount,
        processed: bankTransactions.length,
        inserted,
        updated: Math.max(updated, 0),
        status: "success",
      };
    } catch (error: any) {
      const integrationError = error as BankingIntegrationError;
      const errorDetails = {
        message: error?.message || "Unknown sync error",
        code: integrationError?.code,
        status: integrationError?.status,
        retryable:
          typeof integrationError?.retryable === "boolean"
            ? integrationError.retryable
            : undefined,
        attempts: integrationError?.attempts,
        context: integrationError?.context,
        durationMs: Date.now() - startedAt.getTime(),
      };

      await SyncState.updateOne(
        { userId, sourceAccount },
        {
          $set: {
            lastStatus: "failed",
            lastError: JSON.stringify(errorDetails),
            lastRunEndedAt: new Date(),
          },
          $inc: { totalRuns: 1, failedRuns: 1 },
        },
      );

      await createAuditLog(
        userId,
        {
          action: "TRANSACTION_SYNC_ACCOUNT_FAILED",
          resourceType: "transaction",
          severity: "high",
          metadata: {
            sourceAccount,
            ...errorDetails,
          },
        },
        undefined,
        "failure",
        error,
      );

      return {
        sourceAccount,
        processed: 0,
        inserted: 0,
        updated: 0,
        status: "failed",
        error: errorDetails.message,
      };
    }
  }
}

export default new TransactionSyncService();
