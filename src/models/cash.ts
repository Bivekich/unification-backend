import mongoose, { Document, Schema } from 'mongoose';

interface ICash extends Document {
  amount: number;
  type: 'expense' | 'income';
  description: string;
  date: Date;
}

const CashSchema: Schema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ICash>('Cash', CashSchema);
