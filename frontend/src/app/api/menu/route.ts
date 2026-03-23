import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  nameKm: { type: String },
  description: { type: String },
  descriptionKm: { type: String },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isAvailable: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const MenuItem = mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);

// GET - Fetch menu items for a store
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');

    if (storeId) {
      const menuItems = await MenuItem.find({ storeId }).populate('categoryId', 'name nameKm');
      return NextResponse.json(menuItems);
    }

    return NextResponse.json([]);

  } catch (error) {
    console.error('Menu GET error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create menu item
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const menuItem = new MenuItem(body);
    await menuItem.save();
    
    return NextResponse.json({ 
      message: 'Menu item created successfully', 
      menuItem 
    }, { status: 201 });

  } catch (error) {
    console.error('Menu POST error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update menu item
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const body = await request.json();
    
    const menuItem = await MenuItem.findByIdAndUpdate(id, body, { new: true });
    
    if (!menuItem) {
      return NextResponse.json(
        { message: 'Menu item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Menu item updated successfully', 
      menuItem 
    });

  } catch (error) {
    console.error('Menu PUT error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete menu item
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const menuItem = await MenuItem.findByIdAndDelete(id);
    
    if (!menuItem) {
      return NextResponse.json(
        { message: 'Menu item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Menu item deleted successfully' });

  } catch (error) {
    console.error('Menu DELETE error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
