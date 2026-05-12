import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  nameKm?: string;
  description?: string;
  descriptionKm?: string;
  storeId: mongoose.Types.ObjectId;
  order: number;
  isActive: boolean;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  nameKm: { type: String },
  description: { type: String },
  descriptionKm: { type: String },
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ICategory>('Category', CategorySchema);
