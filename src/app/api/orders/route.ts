import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  tableId: { type: String, required: true },
  items: [{
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    quantity: Number,
    remark: String
  }],
  status: { 
    type: String, 
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

// GET - Fetch orders
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');
    const tableId = searchParams.get('tableId');

    let query: any = {};
    if (storeId) query.storeId = storeId;
    if (tableId) query.tableId = tableId;

    const orders = await Order.find(query).sort({ createdAt: -1 });

    // Manually populate menu items for each order
    const populatedOrders = await Promise.all(
      orders.map(async (order: any) => {
        const orderObj = order.toObject();
        
        // Populate menu item details for each item in the order
        if (orderObj.items && orderObj.items.length > 0) {
          const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', new mongoose.Schema({
            name: String,
            nameKm: String,
            price: Number
          }));
          
          const populatedItems = await Promise.all(
            orderObj.items.map(async (item: any) => {
              if (item.menuItemId) {
                const menuItem = await MenuItem.findById(item.menuItemId).select('name nameKm price');
                return {
                  ...item,
                  name: menuItem?.name || item.name || 'Unknown Item',
                  nameKm: menuItem?.nameKm || '',
                  price: menuItem?.price || item.price || 0
                };
              }
              return item;
            })
          );
          
          orderObj.items = populatedItems;
        }
        
        return orderObj;
      })
    );

    return NextResponse.json(populatedOrders);

  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { storeId, tableId, items } = body;

    if (!storeId || !tableId || !items || items.length === 0) {
      return NextResponse.json(
        { message: 'Missing required order details' },
        { status: 400 }
      );
    }

    const order = new Order({ storeId, tableId, items, status: 'pending' });
    await order.save();
    
    return NextResponse.json({ 
      message: 'Order placed successfully', 
      order 
    }, { status: 201 });

  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update order status
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const { status } = await request.json();
    
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Order updated successfully', 
      order 
    });

  } catch (error) {
    console.error('Orders PUT error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const order = await Order.findByIdAndDelete(id);
    
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Order deleted successfully' });

  } catch (error) {
    console.error('Orders DELETE error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
