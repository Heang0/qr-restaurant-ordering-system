const express = require('express');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all categories for a store (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const categories = await Category.find({ storeId: req.user.storeId });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new category (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
    const { name } = req.body;
    const storeId = req.user.storeId;
    try {
        const category = new Category({ name, storeId });
        await category.save();
        res.status(201).json({ message: 'Category created successfully', category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a category (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    const { name } = req.body;
    const { id } = req.params;
    const storeId = req.user.storeId;

    try {
        const category = await Category.findOne({ _id: id, storeId });
        if (!category) {
            return res.status(404).json({ message: 'Category not found or unauthorized' });
        }
        
        category.name = name;
        await category.save();
        res.json({ message: 'Category updated successfully', category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete a category (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    const { id } = req.params;
    const storeId = req.user.storeId;
    try {
        const category = await Category.findOne({ _id: id, storeId });
        if (!category) {
            return res.status(404).json({ message: 'Category not found or unauthorized' });
        }
        await Category.deleteOne({ _id: id });
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;