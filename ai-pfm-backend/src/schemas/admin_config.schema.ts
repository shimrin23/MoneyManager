import mongoose, { Schema, Document } from "mongoose";

/**
 * Admin Configuration Schema - BRD Section 2.4 (Administrative Portal Controls)
 * Configure recommendation categories, thresholds, and templates
 */
export interface IAdminConfig extends Document {
  configKey: string; // Unique configuration identifier
  configType:
    | "recommendation"
    | "threshold"
    | "category"
    | "segment"
    | "feature_flag"
    | "localization";

  // For recommendations
  recommendationType?:
    | "BUDGET"
    | "SAVINGS_GOAL"
    | "DEBT_OPTIMIZATION"
    | "SUBSCRIPTION_CLEANUP"
    | "INVESTMENT";

  // Multilingual support
  localization?: {
    en?: {
      title?: string;
      description?: string;
      template?: string;
    };
    si?: {
      title?: string;
      description?: string;
      template?: string;
    };
    ta?: {
      title?: string;
      description?: string;
      template?: string;
    };
  };

  // Configuration values
  value: any; // Can be number, string, boolean, object

  // Thresholds
  thresholds?: {
    min?: number;
    max?: number;
    warning?: number;
    critical?: number;
  };

  // Customer segmentation
  customerSegments?: string[]; // e.g., ['premium', 'standard', 'basic']
  isEnabledBySegment?: Record<string, boolean>;

  // Feature control
  isActive: boolean;
  priority?: number; // For ordering recommendations

  // Metadata
  description: string;
  category?: string;
  tags?: string[];

  // Versioning
  version: string;
  previousVersions?: Array<{
    version: string;
    value: any;
    modifiedAt: Date;
    modifiedBy: string;
  }>;

  // Audit
  createdBy: string;
  modifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminConfigSchema: Schema = new Schema(
  {
    configKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    configType: {
      type: String,
      enum: [
        "recommendation",
        "threshold",
        "category",
        "segment",
        "feature_flag",
        "localization",
      ],
      required: true,
      index: true,
    },
    recommendationType: {
      type: String,
      enum: [
        "BUDGET",
        "SAVINGS_GOAL",
        "DEBT_OPTIMIZATION",
        "SUBSCRIPTION_CLEANUP",
        "INVESTMENT",
      ],
    },
    localization: {
      en: {
        title: String,
        description: String,
        template: String,
      },
      si: {
        title: String,
        description: String,
        template: String,
      },
      ta: {
        title: String,
        description: String,
        template: String,
      },
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    thresholds: {
      min: Number,
      max: Number,
      warning: Number,
      critical: Number,
    },
    customerSegments: [String],
    isEnabledBySegment: {
      type: Map,
      of: Boolean,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    priority: { type: Number, default: 0 },
    description: {
      type: String,
      required: true,
    },
    category: { type: String },
    tags: [String],
    version: {
      type: String,
      required: true,
      default: "1.0",
    },
    previousVersions: [
      {
        version: String,
        value: Schema.Types.Mixed,
        modifiedAt: Date,
        modifiedBy: String,
      },
    ],
    createdBy: { type: String, required: true },
    modifiedBy: { type: String },
  },
  {
    timestamps: true,
  },
);

// Indexes
AdminConfigSchema.index({ configType: 1, isActive: 1 });
AdminConfigSchema.index({ recommendationType: 1, isActive: 1 });
AdminConfigSchema.index({ category: 1 });
AdminConfigSchema.index({ tags: 1 });

// Pre-save hook to maintain version history
AdminConfigSchema.pre("save", function (this: IAdminConfig) {
  if (this.isModified("value") && !this.isNew) {
    if (!this.previousVersions) {
      this.previousVersions = [];
    }
    this.previousVersions.push({
      version: this.version,
      value: this.value,
      modifiedAt: new Date(),
      modifiedBy: this.modifiedBy || "system",
    });

    // Increment version
    const [major, minor] = this.version.split(".");
    this.version = `${major}.${parseInt(minor || "0") + 1}`;
  }
});

export default mongoose.model<IAdminConfig>("AdminConfig", AdminConfigSchema);
