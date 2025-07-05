const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Create Admin (Super Admin only)
router.post('/', protect, authorize('superadmin'), async (req, res) => {
    const { email, password, storeId } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Admin with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // FIX 1: Change 'password' to 'passwordHash' to match the User model schema
        user = new User({ email, passwordHash: hashedPassword, role: 'admin', storeId });
        await user.save();
        res.status(201).json({ message: 'Admin created successfully', user: { id: user._id, email: user.email, storeId: user.storeId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// List Admins (Super Admin only) - Populates store name
router.get('/', protect, authorize('superadmin'), async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).populate('storeId', 'name');
        res.json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// NEW ENDPOINT: Reset Admin Password (Super Admin only) - This already exists
router.put('/:id/reset-password', protect, authorize('superadmin'), async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long.' });
    }

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Admin user not found.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt); // Ensure this is passwordHash
        await user.save();

        res.json({ message: 'Admin password reset successfully.' });
    } catch (error) {
        console.error('Error resetting admin password:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// FIX 2: Add Update Admin details (Super Admin only)
// This route is needed for the 'Edit Admin' functionality in the Super Admin dashboard
router.put('/:id', protect, authorize('superadmin'), async (req, res) => {
    const { id } = req.params;
    const { storeId } = req.body; // Assuming only storeId can be updated via frontend 'Edit Admin' form

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Admin user not found.' });
        }

        // Only allow updating fields that are sent (e.g., storeId)
        if (storeId !== undefined) {
            user.storeId = storeId;
        }
        // If you had other editable fields for admin, you would add them here.

        await user.save();
        res.json({ message: 'Admin updated successfully', user: { id: user._id, email: user.email, storeId: user.storeId } });
    } catch (error) {
        console.error('Error updating admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete Admin (Super Admin only)
router.delete('/:id', protect, authorize('superadmin'), async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
