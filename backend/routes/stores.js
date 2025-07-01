const express = require('express');
const Store = require('../models/Store');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Create Store (Super Admin only)
router.post('/', protect, authorize('superadmin'), async (req, res) => {
    const { name } = req.body;
    try {
        const store = new Store({ name });
        await store.save();
        res.status(201).json({ message: 'Store created successfully', store });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// List Stores (Super Admin only)
router.get('/', protect, authorize('superadmin'), async (req, res) => {
    try {
        const stores = await Store.find({});
        res.json(stores);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// CITE: Get a single store's details (Admin only, based on their storeId or SuperAdmin for any store)
router.get('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        // CITE: Ensure admin can only access their assigned store
        if (req.user.role === 'admin' && req.user.storeId.toString() !== store._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have access to this store' });
        }
        res.json(store);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// CITE: Update a Store with logo upload functionality
router.put('/:id', protect, authorize('superadmin', 'admin'), upload.single('logo'), async (req, res) => {
    const { name, address, phone, clearLogo } = req.body;
    const { id } = req.params;
    let logoUrl = null;

    try {
        const store = await Store.findById(id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        if (req.file) {
            if (store.logoUrl) {
                const publicId = store.logoUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`store_logos/${publicId}`);
            }
            const result = await cloudinary.uploader.upload(req.file.path, { folder: 'store_logos' });
            logoUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }

        if (name !== undefined) store.name = name; 
        if (address !== undefined) store.address = address; 
        if (phone !== undefined) store.phone = phone;       

        if (logoUrl) {
            store.logoUrl = logoUrl;
        } else if (clearLogo === 'true') {
            if (store.logoUrl) {
                const publicId = store.logoUrl.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`store_logos/${publicId}`);
            }
            store.logoUrl = null;
        }

        await store.save();
        res.json({ message: 'Store updated successfully', store });
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;