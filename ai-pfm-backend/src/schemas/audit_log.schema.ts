import mongoose, { Schema, Document } from "mongoose";

/**
 * Audit Log Schema - BRD Section 2.4 (Auditability)
 * Full logs of all sensitive operations for compliance
 */
export interface IAuditLog extends Document {
  userId?: string;
  action: string; // e.g., 'RECOMMENDATION_CREATED', 'CONSENT_GRANTED', 'TRANSACTION_PROCESSED'
  resourceType:
    | "transaction"
    | "recommendation"
    | "consent"
    | "user"
    | "goal"
    | "loan"
    | "admin_config";
  resourceId?: string;
  status: "success" | "failure" | "warning";
  severity: "low" | "medium" | "high" | "critical";

  // Request context
  requestMetadata: {
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    requestId?: string;
  };

  // Change tracking
  changes?: {
    before?: any;
    after?: any;
    fields?: string[];
  };

  // Error details
  error?: {
    message?: string;
    code?: string;
    stack?: string;
  };

  // Additional context
  metadata?: any;

  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: String, index: true },
    action: { type: String, required: true, index: true },
    resourceType: {
      type: String,
      enum: [
        "transaction",
        "recommendation",
        "consent",
        "user",
        "goal",
        "loan",
        "admin_config",
      ],
      required: true,
      index: true,
    },
    resourceId: { type: String, index: true },
    status: {
      type: String,
      enum: ["success", "failure", "warning"],
      required: true,
      default: "success",
      index: true,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "low",
      index: true,
    },
    requestMetadata: {
      ipAddress: String,
      userAgent: String,
      endpoint: String,
      method: String,
      requestId: String,
    },
    changes: {
      before: Schema.Types.Mixed,
      after: Schema.Types.Mixed,
      fields: [String],
    },
    error: {
      message: String,
      code: String,
      stack: String,
    },
    metadata: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: false, // Using custom timestamp field
  },
);

// Compound indexes for common audit queries
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, severity: 1, timestamp: -1 });

// TTL index - automatically delete logs older than 2 years (compliance requirement)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 }); // 2 years

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
