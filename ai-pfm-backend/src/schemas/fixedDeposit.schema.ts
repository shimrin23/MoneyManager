import mongoose, { Schema, Document } from 'mongoose';

export interface IFixedDeposit extends Document {
    userId: string;
    bank: string;
    accountNumber: string;
    principalAmount: number;
    interestRate: number;
    tenure: number;
    tenureUnit: 'months' | 'years';
    startDate: Date;
    maturityDate: Date;
    maturityAmount: number;
    interestEarned: number;
    type: 'Standard' | 'Goal-Linked' | 'Tax Saver';
    status: 'active' | 'matured' | 'prematurely-closed';
    autoRenewal: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const FixedDepositSchema: Schema = new Schema(
    {
        userId: { type: String, required: true, index: true },
        bank: { type: String, required: true },
        accountNumber: { type: String },
        principalAmount: { type: Number, required: true },
        interestRate: { type: Number, required: true },
        tenure: { type: Number, required: true },
        tenureUnit: { type: String, enum: ['months', 'years'], default: 'months' },
        startDate: { type: Date, required: true, default: Date.now },
        maturityDate: { type: Date, required: true },
        maturityAmount: { type: Number, required: true },
        interestEarned: { type: Number, required: true },
        type: {
            type: String,
            enum: ['Standard', 'Goal-Linked', 'Tax Saver'],
            default: 'Standard'
        },
        status: {
            type: String,
            enum: ['active', 'matured', 'prematurely-closed'],
            default: 'active'
        },
        autoRenewal: { type: Boolean, default: false }
    },
    { timestamps: true }
);

FixedDepositSchema.index({ userId: 1, status: 1 });

export default mongoose.model<IFixedDeposit>('FixedDeposit', FixedDepositSchema);
