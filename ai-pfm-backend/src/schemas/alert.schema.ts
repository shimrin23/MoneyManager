import mongoose, { Document, Schema } from "mongoose";

export interface IAlert extends Document {
  userId: string;
  type: "high_value" | "overdue" | "overlimit";
  message: string;
  amount: number;
  transactionId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ["high_value", "overdue", "overlimit"],
      required: true,
      index: true,
    },
    message: { type: String, required: true },
    amount: { type: Number, required: true },
    transactionId: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export default mongoose.model<IAlert>("Alert", AlertSchema);
