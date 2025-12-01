import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    userId: string;
    name: string;
    provider: string;
    amount: number;
    frequency: 'monthly' | 'yearly';
    nextPayment: Date;
    category: string;
    isActive: boolean;
    lastUsed?: Date;
    isZombie: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    provider: { type: String, required: true },
    amount: { type: Number, required: true },
    frequency: { 
        type: String, 
        enum: ['monthly', 'yearly'], 
        required: true,
        default: 'monthly'
    },
    nextPayment: { type: Date, required: true },
    category: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    lastUsed: { type: Date },
    isZombie: { type: Boolean, default: false }
}, { 
    timestamps: true 
});

// Index for efficient queries
SubscriptionSchema.index({ userId: 1, isActive: 1 });
SubscriptionSchema.index({ userId: 1, isZombie: 1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);