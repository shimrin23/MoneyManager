import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
  type: "income" | "expense";

  // Enhanced fields for BRD Section 2.1
  mcc?: string; // Merchant Category Code
  merchantId?: string; // Unique merchant identifier
  merchantName?: string; // Raw merchant name from transaction
  normalizedMerchant?: string; // Normalized merchant name

  // Recurring transaction metadata
  isRecurring: boolean;
  recurringFrequency?:
    | "daily"
    | "weekly"
    | "biweekly"
    | "monthly"
    | "quarterly"
    | "yearly";
  recurringDueDate?: Date; // Next expected transaction date
  sourceAccount?: string; // Account identifier

  // Enrichment metadata
  categoryConfidence?: number; // 0-1 confidence score
  processedAt?: Date; // When transaction was enriched
  ingestionType?: "realtime" | "batch"; // How it was ingested

  // Behavioral signals
  isAnomaly?: boolean; // Flagged as unusual spending
  anomalyScore?: number; // 0-1 anomaly confidence

  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true, index: true },
    date: { type: Date, required: true, default: Date.now, index: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
      index: true,
    },

    // Enhanced fields
    mcc: { type: String, index: true },
    merchantId: { type: String, index: true },
    merchantName: { type: String },
    normalizedMerchant: { type: String, index: true },

    // Recurring metadata
    isRecurring: { type: Boolean, default: false, index: true },
    recurringFrequency: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"],
    },
    recurringDueDate: { type: Date },
    sourceAccount: { type: String },

    // Enrichment
    categoryConfidence: { type: Number, min: 0, max: 1 },
    processedAt: { type: Date },
    ingestionType: {
      type: String,
      enum: ["realtime", "batch"],
      default: "batch",
    },

    // Anomaly detection
    isAnomaly: { type: Boolean, default: false },
    anomalyScore: { type: Number, min: 0, max: 1 },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Compound indexes for common queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, isRecurring: 1 });
TransactionSchema.index({ userId: 1, category: 1, date: -1 });
TransactionSchema.index({ userId: 1, normalizedMerchant: 1 });

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
