import mongoose, { Schema, Document } from 'mongoose';

// A conversation with the AI coach, kept so it survives page refreshes and server restarts
export interface IChatSession extends Document {
    sessionId: string;
    userId: string;
    messages: {
        id: string;
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: string;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ChatSessionSchema: Schema = new Schema({
    sessionId: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    messages: [{
        _id: false,
        id: { type: String, required: true },
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: String, required: true }
    }]
}, { timestamps: true });

export default mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);
