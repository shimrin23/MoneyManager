import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditCard extends Document {
    userId: string;
    cardName: string; // e.g., "Visa Signature"
    provider: string;
    creditLimit: number;
    currentBalance: number; // How much used
    availableLimit: number;
    minPaymentDue: number;
    dueDate: Date;
    statementDate: Date;
}

const CreditCardSchema: Schema = new Schema({
    userId: { type: String, required: true },
    cardName: { type: String, required: true },
    provider: { type: String, required: true },
    creditLimit: { type: Number, required: true },
    currentBalance: { type: Number, default: 0 },
    availableLimit: { type: Number, required: true },
    minPaymentDue: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    statementDate: { type: Date }
}, { timestamps: true });

export default mongoose.model<ICreditCard>('CreditCard', CreditCardSchema);