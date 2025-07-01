const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const payload = {
            id: user._id,
            role: user.role,
            storeId: user.storeId // CITE: CRITICAL - Ensure storeId is in the JWT payload for admin users
        };
        
        const token = generateToken(payload);
        
        res.json({
            token,
            role: user.role,
            storeId: user.storeId // CITE: Send storeId to frontend for local storage
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;