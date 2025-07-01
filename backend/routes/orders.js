const express = require('express');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Place Order (Customer)
router.post('/', async (req, res) => {
    const { storeId, tableId, items } = req.body;

    if (!storeId || !tableId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required order details' });
    }

    try {
        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);
            // Ensure the menu item exists and belongs to the correct store
            if (!menuItem || menuItem.storeId.toString() !== storeId) {
                return res.status(400).json({ message: `Invalid menu item or item not found for store: ${item.menuItemId}` });
            }
        }

        const order = new Order({ storeId, tableId, items, status: 'Pending' });
        await order.save();
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- NEW PUBLIC ROUTE: Get Orders for a specific customer (by storeId and tableId) ---
// This route does NOT require authentication, as customers access it via QR code.
router.get('/customer', async (req, res) => {
    const { storeId, tableId } = req.query;

    if (!storeId || !tableId) {
        return res.status(400).json({ message: 'Store ID and Table ID are required to fetch customer orders.' });
    }

    try {
        // Find orders for the specific storeId and tableId.
        // Populate menu item details (name, price, imageUrl) for display.
        // Sort by creation date in descending order (newest first).
        const orders = await Order.find({ storeId, tableId })
                                  .populate('items.menuItemId', 'name price imageUrl')
                                  .sort({ createdAt: -1 }); // Newest orders first

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this table.' });
        }

        res.json(orders);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// List Orders for a store (Admin) - Real-time via polling
router.get('/', protect, authorize('admin'), async (req, res) => {
    const { status } = req.query;
    const query = { storeId: req.user.storeId };
    if (status) {
        query.status = status;
    }
    try {
        const orders = await Order.find(query)
                                  .populate('items.menuItemId', 'name price imageUrl')
                                  .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Order Status (Admin)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const storeId = req.user.storeId;

    try {
        const order = await Order.findOne({ _id: id, storeId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found or unauthorized' });
        }

        if (!['Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' });
        }

        order.status = status;
        await order.save();
        res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// New endpoint to delete all pending/active orders for a specific table
router.delete('/table/:tableId', protect, authorize('admin'), async (req, res) => {
    const { tableId } = req.params;
    const storeId = req.user.storeId;

    try {
        const result = await Order.deleteMany({ 
            storeId, 
            tableId, 
            status: { $in: ['Pending', 'Confirmed', 'Preparing', 'Ready'] } 
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No active orders found for this table or table not found.' });
        }
        res.json({ message: `Successfully cleared ${result.deletedCount} orders for table ${tableId}` });
    } catch (error) {
        console.error('Error clearing table orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;