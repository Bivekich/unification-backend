import { Schema, model, Document } from "mongoose";

interface Transaction extends Document {
  fromCompany?: string;
  fromBank?: string;
  toCompany?: string;
  toBank?: string;
  amount: number;
  type: "internal" | "cash" | "custom" | "replenish";
  date: Date;
  description?: string;
  author: string;
}

const transactionSchema = new Schema<Transaction>({
  fromCompany: { type: String },
  fromBank: { type: String },
  toCompany: { type: String },
  toBank: { type: String },
  amount: { type: Number, rquired: true },
  type: {
    type: String,
    enum: ["internal", "cash", "custom", "replenish"],
    required: true,
  },
  date: { type: Date, default: Date.now },
  description: { type: String },
  author: { type: String, rquired: true },
});

export default model<Transaction>("Transaction", transactionSchema);
