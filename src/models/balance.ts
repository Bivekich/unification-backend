import mongoose, { Document, Schema } from 'mongoose';

interface IBalance extends Document {
  balance: number;
}

const BalanceSchema: Schema = new Schema({
  balance: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model<IBalance>('Balance', BalanceSchema);
