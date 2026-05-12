import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getTables = async (req: Request, res: Response) => {
  try {
    const { storeId } = req.query;
    if (!storeId) return res.status(400).json({ message: 'Store ID required' });

    const { data: tables, error } = await supabase
      .from('tables')
      .select('*')
      .eq('store_id', storeId);

    if (error) throw error;
    
    const mappedTables = tables.map(table => ({
      ...table,
      name: table.table_number,
      storeId: table.store_id
    }));

    res.json(mappedTables);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { name, slug, isActive, storeId, qrCode } = req.body;
    
    // Check for existing table with the same name in the same store
    const { data: existingTables } = await supabase
      .from('tables')
      .select('id')
      .eq('store_id', storeId)
      .eq('table_number', name);

    if (existingTables && existingTables.length > 0) {
      return res.status(400).json({ message: 'A table with this name already exists' });
    }
    
    const { data: table, error } = await supabase
      .from('tables')
      .insert([{
        table_number: name,
        store_id: storeId
      }])
      .select()
      .single();

    if (error) {
      console.error('Create table error:', error);
      throw error;
    }
    
    res.status(201).json({ 
      message: 'Table created successfully', 
      table: {
        ...table,
        name: table.table_number,
        storeId: table.store_id
      } 
    });
  } catch (error: any) {
    console.error('Create table catch error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updateTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, name, storeId, qrCode, slug, ...body } = req.body;
    
    if (name !== undefined) {
      // Ensure the new name doesn't conflict with another table in the same store
      let currentStoreId = storeId;
      if (!currentStoreId) {
        const { data: currentTable } = await supabase.from('tables').select('store_id').eq('id', id).single();
        currentStoreId = currentTable?.store_id;
      }

      if (currentStoreId) {
        const { data: existingTables } = await supabase
          .from('tables')
          .select('id')
          .eq('store_id', currentStoreId)
          .eq('table_number', name)
          .neq('id', id);

        if (existingTables && existingTables.length > 0) {
          return res.status(400).json({ message: 'A table with this name already exists' });
        }
      }
    }

    const updateData: any = { ...body };
    if (name !== undefined) updateData.table_number = name;
    if (storeId !== undefined) updateData.store_id = storeId;

    const { data: table, error } = await supabase
      .from('tables')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !table) return res.status(404).json({ message: 'Table not found' });
    
    res.json({ 
      message: 'Table updated successfully', 
      table: {
        ...table,
        name: table.table_number,
        storeId: table.store_id
      } 
    });
  } catch (error: any) {
    console.error('Update table error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Table deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
