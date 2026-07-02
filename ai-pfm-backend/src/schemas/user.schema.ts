import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string;
  role: 'customer' | 'admin' | 'ops' | 'manager';
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  occupation?: string;
  monthlyIncome?: number; // For loan-to-income ratio calculations
  bankAccounts?: Array<{
    accountId: string;
    instrumentType?:
      | "savings"
      | "current"
      | "credit_card"
      | "fixed_deposit"
      | "loan"
      | "lease"
      | "pawning";
    isActive?: boolean;
  }>;

  // Enhanced fields for BRD compliance
  pfmOptIn?: boolean; // Quick flag for PFM feature access
  customerSegment?: "premium" | "standard" | "basic"; // For segmented features
  preferences?: {
    language?: "en" | "si" | "ta";
    notifications?: boolean;
    emailReports?: boolean;
  };

  // Verification & OAuth
  isVerified?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  isGoogleAccount?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: false },
    role: {
      type: String,
      enum: ['customer', 'admin', 'ops', 'manager'],
      default: 'customer',
      index: true,
    },
    phone: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    address: { type: String, default: '' },
    occupation: { type: String, default: '' },
    monthlyIncome: { type: Number, default: 50000 }, // Default income for loan calculations
    bankAccounts: [
      {
        accountId: { type: String, required: true },
        instrumentType: {
          type: String,
          enum: [
            "savings",
            "current",
            "credit_card",
            "fixed_deposit",
            "loan",
            "lease",
            "pawning",
          ],
          default: "savings",
        },
        isActive: { type: Boolean, default: true },
      },
    ],

    // Verification & OAuth
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    isGoogleAccount: { type: Boolean, default: false },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },

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
