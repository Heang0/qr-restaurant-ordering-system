import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';
import { checkPlanLimit } from '../utils/planLimits.js';

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    if (!storeId) return res.status(400).json({ message: 'Store ID required' });

    const { data: items, error } = await supabase
      .from('menu_items')
      .select('*, categories(*)')
      .eq('store_id', storeId);

    if (error) throw error;
    
    // Map to frontend interface
    const mappedItems = (items || []).map(item => ({
      ...item,
      _id: item.id,
      nameKm: item.name_km,
      descriptionKm: item.description_km,
      categoryId: item.category_id,
      imageUrl: item.image_url || item.image,
      isAvailable: item.is_available,
      options: item.options || []
    }));
    
    res.json(mappedItems);
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { storeId, categoryId, name, nameKm, price, description, descriptionKm, isAvailable, image, ...body } = req.body;
    
    // Check plan limits
    await checkPlanLimit(storeId, 'products');
    
    // Discovery showed: [ 'id', 'name', 'description', 'price', 'image', 'category_id', 'store_id', 'is_available', 'created_at' ]
    const insertData = { 
      name,
      name_km: nameKm,
      description,
      description_km: descriptionKm,
      price: parseFloat(price) || 0,
      image,
      category_id: categoryId || null,
      store_id: storeId,
      is_available: isAvailable !== undefined ? isAvailable : true
    };

    const { data: item, error } = await supabase
      .from('menu_items')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      throw error;
    }
    res.status(201).json({ message: 'Menu item created successfully', menuItem: item });
  } catch (error: any) {
    console.error('Create menu item error:', error);
    if (error.code === 'PLAN_LIMIT_REACHED') {
      return res.status(403).json({ message: 'PLAN_LIMIT_REACHED', details: error.details });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { storeId, categoryId, name, nameKm, price, description, descriptionKm, isAvailable, image } = req.body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (nameKm !== undefined) updateData.name_km = nameKm;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (description !== undefined) updateData.description = description;
    if (descriptionKm !== undefined) updateData.description_km = descriptionKm;
    if (isAvailable !== undefined) updateData.is_available = isAvailable;
    if (image !== undefined) updateData.image = image;
    if (categoryId !== undefined) updateData.category_id = categoryId || null;
    if (storeId !== undefined) updateData.store_id = storeId;

    const { data: item, error } = await supabase
      .from('menu_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update Menu Item Error:', error);
      return res.status(500).json({ message: error.message || 'Server error', details: error });
    }
    res.json({ message: 'Menu item updated successfully', menuItem: item });
  } catch (error: any) {
    console.error('Update menu item error:', error);
    res.status(500).json({ message: error.message || 'Server error', details: error });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
