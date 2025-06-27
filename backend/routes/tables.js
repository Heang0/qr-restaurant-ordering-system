const express = require('express');
const Table = require('../models/Table');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get Tables for a store (Admin)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const tables = await Table.find({ storeId: req.user.storeId });
        res.json(tables);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Table (Admin)
router.post('/', protect, authorize('admin'), async (req, res) => {
    const { tableId } = req.body;
    const storeId = req.user.storeId;
    try {
        const existingTable = await Table.findOne({ storeId, tableId });
        if (existingTable) {
            return res.status(400).json({ message: 'Table ID already exists for this store' });
        }
        const table = new Table({ storeId, tableId });
        await table.save();
        res.status(201).json({ message: 'Table created successfully', table });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Table (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    const { id } = req.params;
    const storeId = req.user.storeId;
    try {
        const table = await Table.findOne({ _id: id, storeId });
        if (!table) {
            return res.status(404).json({ message: 'Table not found or unauthorized' });
        }
        
        await Table.deleteOne({ _id: id, storeId: storeId });
        
        res.json({ message: 'Table deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;