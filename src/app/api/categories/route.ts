import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameKm: { type: String },
  description: { type: String },
  descriptionKm: { type: String },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

// GET - Fetch categories for a store
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const searchParams = request.nextUrl.searchParams;
    const storeId = searchParams.get('storeId');

    if (storeId) {
      const categories = await Category.find({ storeId });
      return NextResponse.json(categories);
    }

    return NextResponse.json([]);

  } catch (error) {
    console.error('Categories GET error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const category = new Category(body);
    await category.save();
    
    return NextResponse.json({ 
      message: 'Category created successfully', 
      category 
    }, { status: 201 });

  } catch (error) {
    console.error('Categories POST error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const body = await request.json();
    
    const category = await Category.findByIdAndUpdate(id, body, { new: true });
    
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Category updated successfully', 
      category 
    });

  } catch (error) {
    console.error('Categories PUT error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
