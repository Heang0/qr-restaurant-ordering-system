import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { checkPlanLimit } from '../utils/planLimits.js';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    if (!storeId) return res.status(400).json({ message: 'Store ID required' });

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('store_id', storeId);

    if (error) throw error;
    
    // Map to frontend interface
    const mappedCategories = (categories || []).map(cat => ({
      ...cat,
      _id: cat.id,
      nameKm: cat.name_km,
      descriptionKm: cat.description_km,
      isActive: cat.is_active
    }));
    
    res.json(mappedCategories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { storeId, name, nameKm, description, descriptionKm, order, isActive } = req.body;
    
    // Check plan limits
    await checkPlanLimit(storeId, 'categories');
    
    const insertData = { 
      name,
      name_km: nameKm,
      description,
      description_km: descriptionKm,
      order: order || 0,
      is_active: isActive !== undefined ? isActive : true,
      store_id: storeId
    };
    
    const { data: category, error } = await supabase
      .from('categories')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }

    const mappedCategory = {
      ...category,
      _id: category.id,
      nameKm: category.name_km,
      descriptionKm: category.description_km,
      isActive: category.is_active
    };
    
    res.status(201).json({ message: 'Category created successfully', category: mappedCategory });
  } catch (error: any) {
    console.error('Create category error:', error);
    if (error.code === 'PLAN_LIMIT_REACHED') {
      return res.status(403).json({ message: 'PLAN_LIMIT_REACHED', details: error.details });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, nameKm, description, descriptionKm, order, isActive, storeId } = req.body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameKm !== undefined) updateData.name_km = nameKm;
    if (description !== undefined) updateData.description = description;
    if (descriptionKm !== undefined) updateData.description_km = descriptionKm;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (storeId !== undefined) updateData.store_id = storeId;
    
    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const mappedCategory = {
      ...category,
      _id: category.id,
      nameKm: category.name_km,
      descriptionKm: category.description_km,
      isActive: category.is_active
    };
    
    res.json({ message: 'Category updated successfully', category: mappedCategory });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
