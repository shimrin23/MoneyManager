import mongoose, { Document, Schema } from "mongoose";

export interface ISyncState extends Document {
  userId: string;
  sourceAccount: string;
  lastSyncedAt?: Date;
  lastSyncCursor?: string;
  lastStatus: "idle" | "running" | "success" | "failed";
  lastError?: string;
  lastRunStartedAt?: Date;
  lastRunEndedAt?: Date;
  lastProcessedCount: number;
  lastInsertedCount: number;
  lastUpdatedCount: number;
  totalRuns: number;
  successRuns: number;
  failedRuns: number;
  createdAt: Date;
  updatedAt: Date;
}

const SyncStateSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    sourceAccount: { type: String, required: true, index: true },
    lastSyncedAt: { type: Date },
    lastSyncCursor: { type: String },
    lastStatus: {
      type: String,
      enum: ["idle", "running", "success", "failed"],
      default: "idle",
      index: true,
    },
    lastError: { type: String },
    lastRunStartedAt: { type: Date },
    lastRunEndedAt: { type: Date },
    lastProcessedCount: { type: Number, default: 0 },
    lastInsertedCount: { type: Number, default: 0 },
    lastUpdatedCount: { type: Number, default: 0 },
    totalRuns: { type: Number, default: 0 },
    successRuns: { type: Number, default: 0 },
    failedRuns: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

SyncStateSchema.index({ userId: 1, sourceAccount: 1 }, { unique: true });

export default mongoose.model<ISyncState>("SyncState", SyncStateSchema);
