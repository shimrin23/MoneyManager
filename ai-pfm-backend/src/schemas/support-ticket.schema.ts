import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
    ticketNumber: string;
    userId: string;
    subject: string;
    message: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

const SupportTicketSchema: Schema = new Schema({
    ticketNumber: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 5000 },
    category: { type: String, default: 'general' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['open', 'closed'], default: 'open' }
}, { timestamps: true });

export default mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
