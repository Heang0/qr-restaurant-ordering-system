import type { Request, Response } from 'express';
import { supabase } from '../config/supabase.js';

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { storeId, tableId, status } = req.query;
    if (!storeId) return res.status(400).json({ message: 'Store ID required' });

    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    let query = supabase
      .from('orders')
      .select('*, tables(*)')
      .eq('store_id', storeId)
      .gte('created_at', twentyFourHoursAgo.toISOString());

    if (tableId) {
      query = query.eq('table_id', tableId);
    }

    if (status === 'active') {
      query = query.in('status', ['pending', 'preparing', 'ready']);
    } else if (status) {
      query = query.eq('status', status);
    }

    const { data: orders, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .insert([req.body])
      .select('*, tables(*)')
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: order, error } = await supabase
      .from('orders')
      .update(req.body)
      .eq('id', id)
      .select('*, tables(*)')
      .single();

    if (error || !order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order updated successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating order ${id} to status: ${status}`);

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('*, tables(*)')
      .single();

    if (error) {
      console.error(`Database error updating order ${id}:`, error);
      return res.status(400).json({ message: error.message || 'Database error' });
    }

    if (!order) {
      return res.status(404).json({ message: `Order ${id} not found` });
    }
    
    res.json({ message: 'Order status updated successfully', order });
  } catch (error: any) {
    console.error('Update status crash:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
