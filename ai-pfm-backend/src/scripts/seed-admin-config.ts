import mongoose from "mongoose";
import AdminConfig from "../schemas/admin_config.schema";
import dotenv from "dotenv";

dotenv.config();

/**
 * Seed script for Phase 1 - Initial Admin Configurations
 * Run this script once after deploying Phase 1 to populate default configurations
 *
 * Usage: npm run seed:admin-config
 */

const defaultConfigs = [
  // Realtime ingestion threshold
  {
    configKey: "realtime_ingestion_threshold",
    configType: "threshold",
    description:
      "Transaction amount threshold for real-time ingestion (in LKR)",
    value: 50000,
    thresholds: {
      warning: 40000,
      critical: 100000,
    },
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },

  // Budget recommendation config
  {
    configKey: "budget_recommendation_enabled",
    configType: "recommendation",
    recommendationType: "BUDGET",
    description: "Enable/disable budget recommendations",
    value: true,
    priority: 1,
    localization: {
      en: {
        title: "Budget Optimization",
        description:
          "Personalized budget recommendations based on your spending patterns",
        template:
          "Based on your spending in {{category}}, we recommend a monthly budget of {{amount}}",
      },
      si: {
        title: "අයවැය ප්‍රශස්තකරණය",
        description: "ඔබේ වියදම් රටා මත පදනම් වූ පුද්ගලික අයවැය නිර්දේශ",
        template:
          "{{category}} හි ඔබේ වියදම් මත පදනම්ව, අපි මාසික අයවැයක් නිර්දේශ කරමු {{amount}}",
      },
      ta: {
        title: "வரவு செலவுத் திட்ட மேம்படுத்தல்",
        description:
          "உங்கள் செலவு முறைகளின் அடிப்படையில் தனிப்பயனாக்கப்பட்ட வரவு செலவுத் திட்ட பரிந்துரைகள்",
        template:
          "{{category}} இல் உங்கள் செலவுகளின் அடிப்படையில், நாங்கள் மாதாந்திர வரவு செலவுத் திட்டத்தை பரிந்துரைக்கிறோம் {{amount}}",
      },
    },
    customerSegments: ["premium", "standard", "basic"],
    isEnabledBySegment: {
      premium: true,
      standard: true,
      basic: true,
    },
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },

  // Savings goal recommendation
  {
    configKey: "savings_goal_recommendation_enabled",
    configType: "recommendation",
    recommendationType: "SAVINGS_GOAL",
    description: "Enable/disable savings goal recommendations",
    value: true,
    priority: 2,
    localization: {
      en: {
        title: "Savings Goal",
        description:
          "Smart savings recommendations to help you reach your financial goals",
        template:
          "You can save {{amount}} monthly to reach your {{goalName}} goal in {{months}} months",
      },
      si: {
        title: "ඉතිරිකිරීමේ ඉලක්කය",
        description:
          "ඔබේ මූල්‍ය ඉලක්ක කරා ළඟා වීමට උපකාරී බුද්ධිමත් ඉතිරිකිරීමේ නිර්දේශ",
      },
      ta: {
        title: "சேமிப்பு இலக்கு",
        description:
          "உங்கள் நிதி இலக்குகளை அடைய உதவும் ஸ்மார்ட் சேமிப்பு பரிந்துரைகள்",
      },
    },
    customerSegments: ["premium", "standard", "basic"],
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },

  // Debt optimization
  {
    configKey: "debt_optimization_enabled",
    configType: "recommendation",
    recommendationType: "DEBT_OPTIMIZATION",
    description: "Enable/disable debt optimization recommendations",
    value: true,
    priority: 3,
    localization: {
      en: {
        title: "Debt Optimization",
        description: "Strategies to reduce debt faster and save on interest",
        template:
          "By paying {{extraAmount}} extra monthly, you can clear your debt {{months}} months earlier",
      },
    },
    customerSegments: ["premium", "standard"],
    isEnabledBySegment: {
      premium: true,
      standard: true,
      basic: false,
    },
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },

  // Subscription cleanup
  {
    configKey: "subscription_cleanup_enabled",
    configType: "recommendation",
    recommendationType: "SUBSCRIPTION_CLEANUP",
    description: "Enable/disable subscription cleanup recommendations",
    value: true,
    priority: 4,
    localization: {
      en: {
        title: "Subscription Management",
        description: "Identify and manage unused or duplicate subscriptions",
        template:
          "You have {{count}} subscriptions. Consider canceling {{unusedCount}} unused ones to save {{savings}} monthly",
      },
    },
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },

  // Financial health score weights
  {
    configKey: "health_score_weights",
    configType: "feature_flag",
    description: "Weights for financial health score calculation",
    value: {
      liquidity: 0.25,
      savings: 0.2,
      debt: 0.25,
      fees: 0.15,
      stability: 0.15,
    },
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },

  // Consent expiry
  {
    configKey: "consent_expiry_days",
    configType: "threshold",
    description: "Default consent expiry in days (0 = no expiry)",
    value: 0,
    thresholds: {
      warning: 30,
      critical: 7,
    },
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },

  // Anomaly detection threshold
  {
    configKey: "anomaly_detection_threshold",
    configType: "threshold",
    description:
      "Anomaly score threshold (0-1) for flagging unusual transactions",
    value: 0.7,
    thresholds: {
      min: 0.5,
      max: 0.9,
      warning: 0.6,
      critical: 0.8,
    },
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },

  // Recurring transaction detection minimum occurrences
  {
    configKey: "recurring_min_occurrences",
    configType: "threshold",
    description: "Minimum number of occurrences to classify as recurring",
    value: 2,
    thresholds: {
      min: 2,
      max: 5,
    },
    isActive: true,
    version: "1.0",
    createdBy: "system",
  },
];

async function seedAdminConfig() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/ai-pfm",
    );
    console.log("Connected to MongoDB");

    console.log("Clearing existing configurations...");
    await AdminConfig.deleteMany({});

    console.log("Inserting default configurations...");
    const inserted = await AdminConfig.insertMany(defaultConfigs);

    console.log(`Successfully inserted ${inserted.length} configurations:`);
    inserted.forEach((config) => {
      console.log(`  ✓ ${config.configKey} (${config.configType})`);
    });

    console.log("\nSeed completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin configurations:", error);
    process.exit(1);
  }
}

// Run the seed
seedAdminConfig();
