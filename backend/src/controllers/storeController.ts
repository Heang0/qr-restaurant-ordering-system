import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { createAuditLog } from './auditController.js';

export const getStores = async (req: Request, res: Response) => {
  try {
    const { id, slug } = req.query;
    
    let query = supabase.from('stores').select('*');
    
    if (id) {
      query = query.eq('id', id);
      const { data: store, error } = await query.single();
      if (error) throw error;
      return res.json({ ...store, isActive: store.is_active });
    }
    
    if (slug) {
      query = query.eq('slug', slug);
      const { data: store, error } = await query.single();
      if (error) throw error;
      return res.json({ ...store, isActive: store.is_active });
    }

    const { data: stores, error } = await query;
    if (error) throw error;
    
    const mappedStores = stores.map(store => ({
      ...store,
      isActive: store.is_active
    }));
    
    res.json(mappedStores);
  } catch (error) {
    console.error('getStores error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStoreById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !store) return res.status(404).json({ message: 'Store not found' });
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createStore = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, isActive, logo_url } = req.body;
    
    const { data: store, error } = await supabase
      .from('stores')
      .insert([{
        name,
        slug,
        description,
        is_active: isActive,
        logo_url
      }])
      .select()
      .single();

    if (error) throw error;

    // Audit Log
    await createAuditLog(undefined, 'CREATE_STORE', 'store', store.id, { name: store.name, slug: store.slug });

    res.status(201).json({ message: 'Store created successfully', store });
  } catch (error) {
    console.error('Store creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, logo, ...body } = req.body;
    
    const updateData: any = { ...body };
    if (isActive !== undefined) {
      updateData.is_active = isActive;
    }
    if (logo !== undefined) {
      updateData.logo_url = logo;
    }
    
    const { data: store, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !store) return res.status(404).json({ message: 'Store not found' });

    // Audit Log
    await createAuditLog(undefined, 'UPDATE_STORE', 'store', id as string, { name: store.name });

    res.json({ message: 'Store updated successfully', store: { ...store, isActive: store.is_active, logo: store.logo_url } });
  } catch (error) {
    console.error('Update store error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStore = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Audit Log
    await createAuditLog(undefined, 'DELETE_STORE', 'store', id as string);

    res.json({ message: 'Store deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
