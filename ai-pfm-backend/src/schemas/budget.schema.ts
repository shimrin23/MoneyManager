import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
    userId: string;
    category: string;
    allocatedAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

const BudgetSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    category: { type: String, required: true },
    allocatedAmount: { type: Number, required: true }
}, { timestamps: true });

BudgetSchema.index({ userId: 1, category: 1 }, { unique: true });

export default mongoose.model<IBudget>('Budget', BudgetSchema);
