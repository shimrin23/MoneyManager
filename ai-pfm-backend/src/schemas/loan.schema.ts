import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
    userId: string;
    type: 'Personal' | 'Home' | 'Lease' | 'Pawning';
    provider: string; // e.g., "Commercial Bank"
    totalAmount: number;
    remainingAmount: number;
    interestRate: number;
    monthlyInstallment: number;
    nextDueDate: Date;
    status: 'Active' | 'Closed' | 'Overdue';
}

const LoanSchema: Schema = new Schema({
    userId: { type: String, required: true }, 
    type: { type: String, enum: ['Personal', 'Home', 'Lease', 'Pawning'], required: true },
    provider: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    monthlyInstallment: { type: Number, required: true },
    nextDueDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Closed', 'Overdue'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model<ILoan>('Loan', LoanSchema);