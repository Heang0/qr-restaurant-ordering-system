import mongoose, { Schema, Document } from 'mongoose';

export interface ITable extends Document {
  storeId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  qrCode?: string;
  isActive: boolean;
}

const TableSchema: Schema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  qrCode: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<ITable>('Table', TableSchema);
