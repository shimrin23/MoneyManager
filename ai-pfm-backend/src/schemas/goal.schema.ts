import mongoose, { Schema, Document } from 'mongoose';

export interface IGoal extends Document {
    userId: string;
    title: string; // e.g., "Buy a Car"
    targetAmount: number;
    currentAmount: number;
    deadline: Date;
    status: 'In Progress' | 'Completed' | 'Paused';
    category?: string; // e.g., "Travel", "Education", "Personal"
    priority?: 'High' | 'Medium' | 'Low';
    description?: string;
}

const GoalSchema: Schema = new Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    status: { type: String, enum: ['In Progress', 'Completed', 'Paused'], default: 'In Progress' },
    category: { type: String, default: 'Personal' },
    priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    description: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model<IGoal>('Goal', GoalSchema);