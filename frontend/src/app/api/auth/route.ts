import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// MongoDB Connection
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin'], default: 'admin' },
  storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function connectDB() {
  if (mongoose.connections[0].readyState) return;
  await mongoose.connect(MONGO_URI);
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 400 }
      );
    }

    const payload = {
      id: user._id,
      role: user.role,
      storeId: user.storeId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '24h'
    });

    return NextResponse.json({
      token,
      role: user.role,
      storeId: user.storeId
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}
