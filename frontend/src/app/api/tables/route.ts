import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import QRCode from 'qrcode';

const TableSchema = new mongoose.Schema({
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  qrCode: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Table = mongoose.models.Table || mongoose.model('Table', TableSchema);

// GET - Fetch tables for a store
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');

    if (storeId) {
      const tables = await Table.find({ storeId });
      return NextResponse.json(tables);
    }

    return NextResponse.json({ message: 'Store ID required' }, { status: 400 });

  } catch (error) {
    console.error('Tables GET error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create table
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const table = new Table(body);
    await table.save();
    
    return NextResponse.json({ 
      message: 'Table created successfully', 
      table 
    }, { status: 201 });

  } catch (error) {
    console.error('Tables POST error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update table
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const body = await request.json();
    
    const table = await Table.findByIdAndUpdate(id, body, { new: true });
    
    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Table updated successfully', 
      table 
    });

  } catch (error) {
    console.error('Tables PUT error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete table
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const table = await Table.findByIdAndDelete(id);
    
    if (!table) {
      return NextResponse.json(
        { message: 'Table not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Table deleted successfully' });

  } catch (error) {
    console.error('Tables DELETE error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
