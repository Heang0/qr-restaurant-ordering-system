const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Create Admin User (Super Admin only)
router.post('/', protect, authorize('superadmin'), async (req, res) => {
    const { email, password, storeId } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({ email, passwordHash, role: 'admin', storeId });
        await user.save();
        res.status(201).json({ message: 'Admin user created successfully', user: { id: user._id, email: user.email, role: user.role, storeId: user.storeId } });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// List Admin Users (Super Admin only)
router.get('/', protect, authorize('superadmin'), async (req, res) => {
    try {
        const admins = await User.find({ role: 'admin' }).select('-passwordHash').populate('storeId', 'name');
        res.json(admins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an Admin's store (Super Admin only)
// Parameter 'id' is correctly named.
router.put('/:id', protect, authorize('superadmin'), async (req, res) => {
    const { storeId } = req.body;
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot edit superadmin' });
        }
        
        user.storeId = storeId;
        await user.save();
        
        res.json({ message: 'Admin store updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete Admin User (Super Admin only)
// Parameter 'id' is correctly named.
router.delete('/:id', protect, authorize('superadmin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot delete superadmin' });
        }
        
        await User.deleteOne({ _id: req.params.id }); 
        
        res.json({ message: 'Admin user deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
