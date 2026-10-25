import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditCardActivity {
    type: 'payment' | 'charge';
    amount: number;
    date: Date;
    note?: string;
}

export interface ICreditCard extends Document {
    userId: string;
    cardName: string; // e.g., "Visa Signature"
    provider: string;
    lastFour?: string; // Last 4 digits shown on the card (optional)
    creditLimit: number;
    currentBalance: number; // How much used
    availableLimit: number;
    minPaymentDue: number;
    dueDate: Date;
    statementDate: Date;
    activity: ICreditCardActivity[]; // Payments and charges recorded in the app
}

const CreditCardSchema: Schema = new Schema({
    userId: { type: String, required: true },
    cardName: { type: String, required: true },
    provider: { type: String, required: true },
    lastFour: { type: String, match: /^\d{4}$/ },
    creditLimit: { type: Number, required: true },
    currentBalance: { type: Number, default: 0 },
    availableLimit: { type: Number, required: true },
    minPaymentDue: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    statementDate: { type: Date },
    activity: [{
        type: { type: String, enum: ['payment', 'charge'], required: true },
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        note: { type: String }
    }]
}, { timestamps: true });

export default mongoose.model<ICreditCard>('CreditCard', CreditCardSchema);
