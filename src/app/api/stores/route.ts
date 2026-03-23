import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  logoUrl: { type: String },
  description: { type: String },
  address: { type: String },
  phone: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Store = mongoose.models.Store || mongoose.model('Store', StoreSchema);

// GET - Fetch stores
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');

    if (slug) {
      const store = await Store.findOne({ slug });
      if (!store) {
        return NextResponse.json({ message: 'Store not found' }, { status: 404 });
      }
      return NextResponse.json(store);
    }

    if (id) {
      const store = await Store.findById(id);
      if (!store) {
        return NextResponse.json({ message: 'Store not found' }, { status: 404 });
      }
      return NextResponse.json(store);
    }

    const stores = await Store.find({});
    return NextResponse.json(stores);

  } catch (error) {
    console.error('Stores GET error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create store
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const store = new Store(body);
    await store.save();
    
    return NextResponse.json({ 
      message: 'Store created successfully', 
      store 
    }, { status: 201 });

  } catch (error) {
    console.error('Stores POST error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update store
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const body = await request.json();
    
    const store = await Store.findByIdAndUpdate(id, body, { new: true });
    
    if (!store) {
      return NextResponse.json(
        { message: 'Store not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Store updated successfully', 
      store 
    });

  } catch (error) {
    console.error('Stores PUT error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete store
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const store = await Store.findByIdAndDelete(id);
    
    if (!store) {
      return NextResponse.json(
        { message: 'Store not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Store deleted successfully' });

  } catch (error) {
    console.error('Stores DELETE error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
