import { Schema, model, Document } from 'mongoose';

interface Bank {
  name: string;
  balance: number;
}

interface Company extends Document {
  name: string;
  banks: Bank[];
}

const companySchema = new Schema<Company>({
  name: { type: String, required: true, unique: true },
  banks: [{
    name: { type: String, required: true },
    balance: { type: Number, required: true }
  }]
});

export default model<Company>('Company', companySchema);
