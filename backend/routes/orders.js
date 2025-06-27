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
            if (!menuItem || menuItem.storeId.toString() !== storeId) {
                return res.status(400).json({ message: `Invalid menu item or item not found for store: ${item.menuItemId}` });
            }
        }

        const order = new Order({ storeId, tableId, items, status: 'Pending' });
        await order.save();
        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (error) {
        console.error(error);
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
                                  .populate('items.menuItemId', 'name price')
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

module.exports = router;