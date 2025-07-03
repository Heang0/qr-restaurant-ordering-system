const express = require('express');
const Store = require('../models/Store');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// Helper function to generate a URL-friendly slug
function generateSlug(name) {
    return name
        .toString()
        .normalize('NFD') // Normalize Unicode characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/--+/g, '-'); // Replace multiple - with single -
}

// Create Store (Super Admin only)
router.post('/', protect, authorize('superadmin'), async (req, res) => {
    const { name } = req.body;
    try {
        const slug = generateSlug(name); // Generate slug from name
        const store = new Store({ name, slug }); // Save with slug
        await store.save();
        res.status(201).json({ message: 'Store created successfully', store });
    } catch (error) {
        console.error(error);
        // Handle duplicate slug error specifically
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
            return res.status(400).json({ message: 'Store name (and its slug) already exists. Please choose a different name.' });
        }
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

// Get a single store's details by ID (Admin only, based on their storeId or SuperAdmin for any store)
router.get('/:id', protect, authorize('superadmin', 'admin'), async (req, res) => {
    const { id } = req.params;
    try {
        const store = await Store.findById(id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        // Ensure admin can only access their own store
        if (req.user.role === 'admin' && store._id.toString() !== req.user.storeId) {
            return res.status(403).json({ message: 'Forbidden: You can only access your own store details.' });
        }
        res.json(store);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// NEW PUBLIC ROUTE: Get a single store's details by SLUG (No authentication required)
router.get('/public/:slug', async (req, res) => {
    const { slug } = req.params;
    try {
        const store = await Store.findOne({ slug }); // Find by slug
        if (!store) {
            return res.status(404).json({ message: 'Store not found with that slug.' });
        }
        res.json(store);
    } catch (error) {
        console.error('Error fetching public store by slug:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Update Store details (Admin or Super Admin)
router.put('/:id', protect, authorize('superadmin', 'admin'), upload.single('logo'), async (req, res) => {
    const { name, address, phone, clearLogo } = req.body;
    const { id } = req.params;
    let logoUrl = null;

    try {
        const store = await Store.findById(id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        // Ensure admin can only update their own store
        if (req.user.role === 'admin' && store._id.toString() !== req.user.storeId) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own store.' });
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

        if (name !== undefined) {
            store.name = name;
            store.slug = generateSlug(name); // Regenerate slug if name changes
        }
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
        console.error(error);
        // Handle duplicate slug error specifically during update
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
            return res.status(400).json({ message: 'Updated store name (and its slug) already exists. Please choose a different name.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete Store (Super Admin only)
router.delete('/:id', protect, authorize('superadmin'), async (req, res) => {
    const { id } = req.params;
    try {
        const store = await Store.findByIdAndDelete(id);
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        // Also delete associated logo from Cloudinary if it exists
        if (store.logoUrl) {
            const publicId = store.logoUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`store_logos/${publicId}`);
        }
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;