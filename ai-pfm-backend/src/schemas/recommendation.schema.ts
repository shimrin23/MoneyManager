import mongoose, { Schema, Document } from 'mongoose';

export interface IRecommendation extends Document {
    userId: string;
    category: 'budget' | 'goal' | 'debt' | 'subscription' | 'alert';
    icon: string;
    title: string;
    reason: string;
    action: string;
    projectedImpact: string;
    executionPath: string;
    status: 'pending' | 'accepted' | 'declined' | 'snoozed';
    savingsAmount?: number;
    priority: 'critical' | 'high' | 'medium' | 'low';
    createdAt: Date;
    updatedAt: Date;
}

const RecommendationSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    category: { 
        type: String, 
        enum: ['budget', 'goal', 'debt', 'subscription', 'alert'],
        required: true 
    },
    icon: { type: String, required: true },
    title: { type: String, required: true },
    reason: { type: String, required: true },
    action: { type: String, required: true },
    projectedImpact: { type: String, required: true },
    executionPath: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'accepted', 'declined', 'snoozed'],
        default: 'pending' 
    },
    savingsAmount: { type: Number },
    priority: { 
        type: String, 
        enum: ['critical', 'high', 'medium', 'low'],
        default: 'medium'
    }
}, { timestamps: true });

export default mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
