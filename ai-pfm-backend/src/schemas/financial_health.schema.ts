import mongoose, { Schema, Document } from 'mongoose';

export interface IFinancialHealth extends Document {
    userId: string;
    score: number;
    riskLevel: string;
    metrics: {
        liquidityRatio: number;
        debtToIncomeRatio: number;
        savingsRate: number;
    };
    lastUpdated: Date;
}

const FinancialHealthSchema: Schema = new Schema({
    userId: { type: String, required: true },
    score: { type: Number, default: 0 },
    riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    metrics: {
        liquidityRatio: Number,
        debtToIncomeRatio: Number,
        savingsRate: Number
    },
    lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<IFinancialHealth>('FinancialHealth', FinancialHealthSchema);