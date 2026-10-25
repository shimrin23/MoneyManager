import mongoose, { Document, Schema } from 'mongoose';

export interface ILease extends Document {
    userId: mongoose.Types.ObjectId;
    assetName: string;
    assetType: 'vehicle' | 'equipment' | 'property' | 'other';
    lessor: string;
    principalAmount: number;
    monthlyPayment: number;
    interestRate: number;
    tenureMonths: number;
    remainingMonths: number;
    outstandingBalance: number;
    // Installments paid so far: the ones already due when the lease was added, plus recorded payments
    paidMonths?: number;
    payments: { amount: number; date: Date }[];
    startDate: Date;
    endDate: Date;
    nextPaymentDate: Date | null;
    status: 'active' | 'completed' | 'defaulted';
    icon: string;
}

const LeaseSchema = new Schema<ILease>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assetName: { type: String, required: true },
    assetType: { type: String, enum: ['vehicle', 'equipment', 'property', 'other'], required: true },
    lessor: { type: String, required: true },
    principalAmount: { type: Number, required: true },
    monthlyPayment: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    tenureMonths: { type: Number, required: true },
    remainingMonths: { type: Number, required: true },
    outstandingBalance: { type: Number, required: true },
    paidMonths: { type: Number },
    payments: [{
        amount: { type: Number, required: true },
        date: { type: Date, required: true }
    }],
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    nextPaymentDate: { type: Date },
    status: { type: String, enum: ['active', 'completed', 'defaulted'], default: 'active' },
    icon: { type: String, default: '📄' }
}, {
    timestamps: true
});

export default mongoose.model<ILease>('Lease', LeaseSchema);
