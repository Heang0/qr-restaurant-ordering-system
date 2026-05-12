import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { createAuditLog } from './auditController.js';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, store_id, full_name, profile_image, created_at');

    if (error) throw error;
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, store_id, full_name, profile_image, created_at')
      .eq('id', id)
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role, storeId, full_name } = req.body;
    
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: passwordHash, role, store_id: storeId, full_name }])
      .select('id, email, role, full_name')
      .single();

    if (error) throw error;

    // Audit Log
    await createAuditLog(undefined, 'CREATE_USER', 'user', user.id, { email: user.email, role: user.role });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { password, profile_image, storeId, ...body } = req.body;
    const updateData: any = { ...body };
    
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
    }

    if (profile_image) {
      updateData.profile_image = profile_image;
    }

    if (storeId) {
      updateData.store_id = storeId;
    }
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, email, role, full_name, profile_image')
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    // Audit Log
    await createAuditLog(undefined, 'UPDATE_USER', 'user', id, { email: user.email });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', id)
      .single();

    if (user?.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete a superadmin account' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Audit Log
    await createAuditLog(undefined, 'DELETE_USER', 'user', id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
