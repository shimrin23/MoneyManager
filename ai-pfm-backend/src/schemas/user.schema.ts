import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  monthlyIncome?: number; // For loan-to-income ratio calculations

  // Enhanced fields for BRD compliance
  pfmOptIn?: boolean; // Quick flag for PFM feature access
  customerSegment?: "premium" | "standard" | "basic"; // For segmented features
  preferences?: {
    language?: "en" | "si" | "ta";
    notifications?: boolean;
    emailReports?: boolean;
  };

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    monthlyIncome: { type: Number, default: 50000 }, // Default income for loan calculations

    // Enhanced fields
    pfmOptIn: { type: Boolean, default: false, index: true },
    customerSegment: {
      type: String,
      enum: ["premium", "standard", "basic"],
      default: "standard",
      index: true,
    },
    preferences: {
      language: {
        type: String,
        enum: ["en", "si", "ta"],
        default: "en",
      },
      notifications: { type: Boolean, default: true },
      emailReports: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", UserSchema);
