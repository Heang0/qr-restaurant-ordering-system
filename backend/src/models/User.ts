import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: 'superadmin' | 'admin';
  storeId?: mongoose.Types.ObjectId;
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store' }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
