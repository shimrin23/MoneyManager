import mongoose, { Document, Schema } from 'mongoose';

export interface IPawning extends Document {
    userId: mongoose.Types.ObjectId;
    itemDescription: string;
    itemType: 'gold' | 'jewelry' | 'electronics' | 'documents' | 'other';
    icon: string;
    pledgedValue: number;
    loanAmount: number;
    interestRate: number;
    monthlyInterest: number;
    pledgeDate: Date;
    redemptionDate: Date;
    branch: string;
    ticketNumber: string;
    status: 'active' | 'redeemed' | 'auctioned' | 'renewed';
    daysRemaining: number;
    totalInterestAccrued: number;
    totalDue: number;
}

const PawningSchema = new Schema<IPawning>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemDescription: { type: String, required: true },
    itemType: { type: String, enum: ['gold', 'jewelry', 'electronics', 'documents', 'other'], required: true },
    icon: { type: String, default: '💍' },
    pledgedValue: { type: Number, required: true },
    loanAmount: { type: Number, required: true },
    interestRate: { type: Number, required: true },
    monthlyInterest: { type: Number, required: true },
    pledgeDate: { type: Date, required: true },
    redemptionDate: { type: Date, required: true },
    branch: { type: String, required: true },
    ticketNumber: { type: String, required: true },
    status: { type: String, enum: ['active', 'redeemed', 'auctioned', 'renewed'], default: 'active' },
    daysRemaining: { type: Number, default: 0 },
    totalInterestAccrued: { type: Number, default: 0 },
    totalDue: { type: Number, required: true }
}, {
    timestamps: true
});

export default mongoose.model<IPawning>('Pawning', PawningSchema);
