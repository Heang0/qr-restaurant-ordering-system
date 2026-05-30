import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { createAuditLog } from './auditController.js';
import { BakongKHQR, khqrData, IndividualInfo } from 'bakong-khqr';
import QRCode from 'qrcode';
import { verifyBakongTransaction } from '../utils/bakong.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: passwordHash, role: role || 'admin' }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = (rawEmail || '').toLowerCase().trim();
    console.log(`[AUTH] Login attempt for: ${email}`);
    console.log(`[AUTH] Password received length: ${password?.length}, chars: ${JSON.stringify(password)}`);

    if (!email || !password) {
       console.error('[AUTH] Missing email or password');
       return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('[AUTH] Querying Supabase for user...');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('[AUTH] Supabase error during user fetch:', error.message);
      return res.status(400).json({ message: 'Database error fetching user' });
    }

    if (!user || !user.password_hash) {
      console.error('[AUTH] User not found or missing password hash in DB');
      return res.status(400).json({ message: 'User email not found in database' });
    }

    console.log('[AUTH] Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.warn('[AUTH] Password mismatch for user:', email);
      return res.status(400).json({ message: 'Incorrect password provided' });
    }

    console.log('[AUTH] Generating JWT token...');
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    console.log('[AUTH] JWT Secret length:', jwtSecret.length);
    
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );
    console.log('[AUTH] JWT generated successfully');

    // Audit Login
    console.log('[AUTH] Creating audit log...');
    try {
      await createAuditLog(user.id, 'USER_LOGIN', 'auth', user.id, { email: user.email, role: user.role });
    } catch (auditError: any) {
      console.error('[AUTH] Audit log failed (non-blocking):', auditError.message);
    }

    console.log('[AUTH] Login successful for:', email);
    res.json({ 
      token, 
      userId: user.id,
      email: user.email,
      role: user.role,
      profile_image: user.profile_image,
      storeId: user.store_id 
    });
  } catch (error: any) {
    console.error('[AUTH] UNEXPECTED CRITICAL ERROR:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: error.stack
    });
  }
};



export const completeRegistration = async (req: Request, res: Response) => {
  try {
    const { email: rawEmail, password, storeName } = req.body;
    const email = (rawEmail || '').toLowerCase().trim();

    if (!email || !password || !storeName) {
      return res.status(400).json({ message: 'Email, password, and storeName are required' });
    }
    
    // 2. Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 3. Create Store
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if store slug exists
    const { data: existingStore } = await supabase
      .from('stores')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingStore) {
      return res.status(400).json({ message: 'Store name already taken. Please try another.' });
    }

    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert([{
        name: storeName,
        slug: slug,
        is_active: true,
        plan: 'free' // Mark as free plan initially
      }])
      .select()
      .single();

    if (storeError || !store) {
      console.error('Store creation error:', storeError);
      return res.status(500).json({ message: 'Failed to create store' });
    }

    // 4. Create User
    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash: passwordHash,
        role: 'admin',
        store_id: store.id
      }])
      .select()
      .single();

    if (userError || !user) {
      console.error('User creation error:', userError);
      return res.status(500).json({ message: 'Failed to create user' });
    }

    // 5. Generate Login Token
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      userId: user.id,
      email: user.email,
      role: user.role,
      storeId: user.store_id
    });

  } catch (error: any) {
    console.error('[REGISTRATION] CRITICAL ERROR:', error);
    if (error.message === 'BAKONG_TOKEN_INVALID' || error.message === 'BAKONG_TOKEN_MISSING') {
      return res.status(500).json({ message: 'Server Configuration Error: Invalid Bakong Token' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
