import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId;
  quantity: number;
  remark?: string;
  // Temporary fields used for populating data in queries
  name?: string;
  nameKm?: string;
  price?: number;
}

export interface IOrder extends Document {
  storeId: mongoose.Types.ObjectId;
  tableId: string;
  items: IOrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}

const OrderSchema: Schema = new Schema({
  storeId: { type: Schema.Types.ObjectId, ref: 'Store', required: true },
  tableId: { type: String, required: true },
  items: [{
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: { type: Number, required: true },
    remark: { type: String }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', OrderSchema);
