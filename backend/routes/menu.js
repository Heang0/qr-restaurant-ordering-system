const express = require('express');
const MenuItem = require('../models/MenuItem');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('../utils/cloudinary');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// --- PUBLIC ROUTE: Get Menu Items for CUSTOMER ordering page (NO AUTH) ---
router.get('/public', async (req, res) => {
    const { storeId } = req.query;
    console.log('Received storeId in query:', storeId);
    try {
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required' });
        }
        
        const menuItems = await MenuItem.find({ storeId, isAvailable: true }) // Filter for available items
                                      .populate('categoryId', 'name')
                                      .populate('storeId', 'name logoUrl'); 
        console.log('Found menu items from DB:', menuItems);

        res.json(menuItems);
    } catch (error) {
        console.error('Error in /menu/public route:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- PROTECTED ROUTE: Get Menu Items for ADMIN dashboard (REQUIRES AUTH) ---
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const menuItems = await MenuItem.find({ storeId: req.user.storeId }).populate('categoryId', 'name');
        res.json(menuItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add Menu Item (Admin)
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    const { name, description, price, categoryId, isBestSeller, isAvailable } = req.body;
    const storeId = req.user.storeId;
    let imageUrl = null;

    try {
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'menu_items' });
            imageUrl = result.secure_url;
            const fs = require('fs'); // Ensure fs is required if used here
            fs.unlinkSync(req.file.path);
        }
        
        const menuItem = new MenuItem({ 
            storeId, 
            name, 
            description, 
            price, 
            imageUrl, 
            categoryId, 
            isBestSeller: isBestSeller === 'true', 
            isAvailable: isAvailable === 'true' 
        });
        await menuItem.save();
        res.status(201).json({ message: 'Menu item created successfully', menuItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Menu Item (Admin)
// Ensure ':id' is correctly named as 'id'
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
    const { name, description, price, categoryId, isBestSeller, isAvailable } = req.body;
    const storeId = req.user.storeId;
    const { id } = req.params; // Correctly destructure 'id' from req.params
    let imageUrl = null;

    try {
        const menuItem = await MenuItem.findOne({ _id: id, storeId });
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found or unauthorized' });
        }

        if (req.file) {
            if (menuItem.imageUrl) {
                const publicId = menuItem.imageUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`menu_items/${publicId}`);
            }
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'menu_items' });
            imageUrl = result.secure_url;
            const fs = require('fs'); // Ensure fs is required if used here
            fs.unlinkSync(req.file.path); 
        }

        menuItem.name = name || menuItem.name;
        menuItem.description = description || menuItem.description;
        menuItem.price = price || menuItem.price;
        menuItem.categoryId = categoryId || menuItem.categoryId;
        if (isBestSeller !== undefined) {
             menuItem.isBestSeller = isBestSeller === 'true';
        }
        if (isAvailable !== undefined) {
             menuItem.isAvailable = isAvailable === 'true';
        }
        
        if (imageUrl) {
            menuItem.imageUrl = imageUrl;
        }
        
        await menuItem.save();
        res.json({ message: 'Menu item updated successfully', menuItem });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Menu Item (Admin)
// Ensure ':id' is correctly named as 'id'
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    const { id } = req.params; // Correctly destructure 'id' from req.params
    const storeId = req.user.storeId;

    try {
        const menuItem = await MenuItem.findOne({ _id: id, storeId });
        if (!menuItem) {
            return res.status(404).json({ message: 'Menu item not found or unauthorized' });
        }
        if (menuItem.imageUrl) {
            const publicId = menuItem.imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`menu_items/${publicId}`);
        }
        await MenuItem.deleteOne({ _id: id, storeId: storeId });
        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
