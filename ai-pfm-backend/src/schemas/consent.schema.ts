import mongoose, { Schema, Document } from "mongoose";

/**
 * Consent Management Schema - BRD Section 2.1 (Compliance & Consent)
 * Tracks customer opt-in for PFM data analysis and recommendations
 */
export interface IConsent extends Document {
  userId: string;
  consentType: "pfm_analysis" | "data_sharing" | "marketing" | "third_party";
  status: "granted" | "revoked" | "expired";
  version: string; // Version of consent terms
  grantedAt: Date;
  revokedAt?: Date;
  expiresAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata: {
    source?: string; // web, mobile, etc.
    documentUrl?: string; // Link to consent document
    consentText?: string; // Snapshot of consent text
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema: Schema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    consentType: {
      type: String,
      enum: ["pfm_analysis", "data_sharing", "marketing", "third_party"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["granted", "revoked", "expired"],
      required: true,
      default: "granted",
      index: true,
    },
    version: {
      type: String,
      required: true,
    },
    grantedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    revokedAt: { type: Date },
    expiresAt: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String },
    metadata: {
      source: { type: String },
      documentUrl: { type: String },
      consentText: { type: String },
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes
ConsentSchema.index({ userId: 1, consentType: 1, status: 1 });
ConsentSchema.index({ userId: 1, status: 1, expiresAt: 1 });

// Virtual for checking if consent is active
ConsentSchema.virtual("isActive").get(function () {
  if (this.status !== "granted") return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
});

export default mongoose.model<IConsent>("Consent", ConsentSchema);
