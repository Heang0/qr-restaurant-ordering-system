import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  nameKm?: string;
  description?: string;
  descriptionKm?: string;
  price: number;
  imageUrl?: string;
  categoryId?: mongoose.Types.ObjectId;
  isAvailable: boolean;
  order: number;
}

const MenuItemSchema: Schema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  nameKm: { type: String },
  description: { type: String },
  descriptionKm: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
  isAvailable: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
