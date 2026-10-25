import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    userId: string;
    type: 'info' | 'warning' | 'success' | 'alert';
    title: string;
    message: string;
    link?: string;
    actionRequired: boolean;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: String, required: true, index: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'alert'], default: 'info' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    actionRequired: { type: Boolean, default: false },
    read: { type: Boolean, default: false, index: true }
}, { timestamps: true });

export default mongoose.model<INotification>('Notification', NotificationSchema);
