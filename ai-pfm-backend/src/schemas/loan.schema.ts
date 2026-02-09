import mongoose, { Schema, Document } from 'mongoose';

export interface ILoan extends Document {
    userId: string;
    type: 'Personal' | 'Home' | 'Vehicle' | 'Education' | 'Lease' | 'Pawning';
    provider: string;
    principal: number;
    totalAmount: number;
    remainingAmount: number;
    interestRate: number;
    tenure: number; // in months
    monthlyInstallment: number;
    totalInterest: number;
    startDate: Date;
    nextDueDate: Date;
    endDate: Date;
    status: 'Active' | 'Closed' | 'Overdue';
    paymentSchedule?: Array<{
        month: number;
        principalPayment: number;
        interestPayment: number;
        remainingBalance: number;
        dueDate: Date;
        paid: boolean;
        paidDate?: Date;
    }>;
    alerts?: string[];
    customNotes?: string;
}

const LoanSchema: Schema = new Schema({
    userId: { type: String, required: true }, 
    type: { type: String, enum: ['Personal', 'Home', 'Vehicle', 'Education', 'Lease', 'Pawning'], required: true },
    provider: { type: String, required: true },
    principal: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    remainingAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenure: { type: Number, required: true }, // months
    monthlyInstallment: { type: Number, required: true },
    totalInterest: { type: Number, required: true },
    startDate: { type: Date, required: true },
    nextDueDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Closed', 'Overdue'], default: 'Active' },
    paymentSchedule: [{
        month: Number,
        principalPayment: Number,
        interestPayment: Number,
        remainingBalance: Number,
        dueDate: Date,
        paid: Boolean,
        paidDate: Date
    }],
    alerts: [String],
    customNotes: String
}, { timestamps: true });

export default mongoose.model<ILoan>('Loan', LoanSchema);