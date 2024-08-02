import { Schema, model, Document } from 'mongoose';

interface Transaction extends Document {
  fromCompany: string;
  fromBank?: string;
  toCompany: string;
  toBank?: string;
  amount: number;
  type: 'internal' | 'cash' | 'custom';
  date: Date;
  description?: string;
}

const transactionSchema = new Schema<Transaction>({
  fromCompany: { type: String, required: true },
  fromBank: { type: String },
  toCompany: { type: String, required: true },
  toBank: { type: String },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['internal', 'cash', 'custom'], required: true },
  date: { type: Date, default: Date.now },
  description: { type: String },
});

export default model<Transaction>('Transaction', transactionSchema);
