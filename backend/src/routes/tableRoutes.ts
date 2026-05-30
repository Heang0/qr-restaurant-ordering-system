import express from 'express';
import { getTables, createTable, updateTable, deleteTable, callWaiter } from '../controllers/tableController.js';

const router = express.Router();

router.get('/', getTables);
router.post('/', createTable);
router.post('/call-waiter', callWaiter);
router.put('/:id', updateTable);
router.patch('/:id/request-bill', async (req, res) => {
  try {
    const { id } = req.params;
    const { supabase } = await import('../config/supabase.js');
    const { error } = await supabase.from('tables').update({ bill_requested: true }).eq('id', id);
    if (error) throw error;
    res.json({ message: 'Bill requested' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
router.post('/:id/clear', async (req, res) => {
  try {
    const { id } = req.params;
    const { storeId } = req.body;
    const { supabase } = await import('../config/supabase.js');
    
    // Reset table
    await supabase.from('tables').update({ bill_requested: false }).eq('id', id);
    
    // Mark all active orders for this table as completed (paid)
    if (storeId) {
       await supabase.from('orders')
         .update({ status: 'completed' })
         .eq('store_id', storeId)
         .eq('table_id', id)
         .in('status', ['pending', 'preparing', 'ready']);
    }
    
    res.json({ message: 'Table cleared' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});
router.delete('/:id', deleteTable);

export default router;
