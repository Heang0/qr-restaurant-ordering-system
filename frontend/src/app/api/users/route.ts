import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// GET - Fetch users
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const users = await User.find({}).select('-passwordHash');
    return NextResponse.json(users);

  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// POST - Create user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password, role, storeId } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ email, passwordHash, role, storeId });
    await user.save();
    
    return NextResponse.json({ 
      message: 'User created successfully',
      user: { id: user._id, email: user.email, role: user.role }
    }, { status: 201 });

  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const { password, ...body } = await request.json();
    
    const updateData: any = { ...body };
    
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'User updated successfully', 
      user 
    });

  } catch (error) {
    console.error('Users PUT error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Users DELETE error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
