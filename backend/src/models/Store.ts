import mongoose, { Schema, Document } from 'mongoose';

export interface IStore extends Document {
  name: string;
  slug?: string;
  logoUrl?: string;
  description?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
}

const StoreSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  logoUrl: { type: String },
  description: { type: String },
  address: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IStore>('Store', StoreSchema);
