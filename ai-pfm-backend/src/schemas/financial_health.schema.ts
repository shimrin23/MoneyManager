import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialHealth extends Document {
    userId: string;
    score: number | null; // null until there is enough data for a score
    status: string | null;
    riskLevel: string | null;
    hasData: boolean;
    metrics: {
        liquidityRatio: number;
        debtToIncomeRatio: number;
        savingsRate: number;
        creditUtilization: number;
        emergencyFund: number;
        emergencyFundMonths: number;
        netWorth: number;
        discretionaryRatio: number;
    };
    lastUpdated: Date;
}

const FinancialHealthSchema: Schema = new Schema({
    userId: { type: String, required: true },
    score: { type: Number, default: null },
    status: { type: String, default: null },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Very High', null], default: null },
    hasData: { type: Boolean, default: false },
    metrics: {
        liquidityRatio: Number,
        debtToIncomeRatio: Number,
        savingsRate: Number,
        creditUtilization: Number,
        emergencyFund: Number,
        emergencyFundMonths: Number,
        netWorth: Number,
        discretionaryRatio: Number
    },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IFinancialHealth>('FinancialHealth', FinancialHealthSchema);
