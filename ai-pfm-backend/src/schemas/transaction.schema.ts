import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
    userId: string;
    amount: number;
    category: string;
    date: Date;
    description?: string;
    type: 'income' | 'expense';
    createdAt: Date;
}

const TransactionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    description: { type: String },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);