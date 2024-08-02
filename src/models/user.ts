import { Schema, model, Document } from 'mongoose';

interface User extends Document {
  username: string;
  password: string;
  role: 'user' | 'cashier' | 'admin';
}

const userSchema = new Schema<User>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'cashier', 'admin'], required: true }
});

export default model<User>('User', userSchema);
