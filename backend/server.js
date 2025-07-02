    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors'); // Keep cors import
    const path = require('path');
    const config = require('./config');

    const authRoutes = require('./routes/auth');
    const userRoutes = require('./routes/users');
    const storeRoutes = require('./routes/stores');
    const menuRoutes = require('./routes/menu');
    const tableRoutes = require('./routes/tables');
    const orderRoutes = require('./routes/orders');
    const categoriesRoutes = require('./routes/categories');

    const app = express();

    // Connect to MongoDB
    mongoose.connect(config.mongoURI)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err));

    // Middleware
    app.use(express.json());

    // --- Explicit CORS Configuration ---
    // Allow requests only from your specific frontend domain.
    const corsOptions = {
        origin: 'https://qr-restaurant-ordering-system-1.onrender.com', // Replace with your actual frontend URL
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, // Allow cookies to be sent
        optionsSuccessStatus: 204 // For preflight requests
    };
    app.use(cors(corsOptions)); // Use the configured CORS middleware


    // --- NEW: API Request Logger Middleware ---
    // This logs requests that hit /api
    app.use('/api', (req, res, next) => {
        console.log(`API Request: ${req.method} ${req.originalUrl}`);
        next(); // Pass control to the next middleware/route handler
    });

    // --- API Routes (MUST BE FIRST) ---
    // These routes handle all your backend API calls.
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/stores', storeRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/tables', tableRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/categories', categoriesRoutes);

    // Define the absolute path to your frontend public directory
    const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');

    // --- Explicitly serve core HTML files ---
    app.get('/login.html', (req, res) => {
        res.sendFile(path.join(frontendPublicPath, 'login.html'));
    });

    app.get('/index.html', (req, res) => {
        res.sendFile(path.join(frontendPublicPath, 'index.html'));
    });

    app.get('/admin.html', (req, res) => {
        res.sendFile(path.join(frontendPublicPath, 'admin.html'));
    });

    app.get('/order.html', (req, res) => {
        res.sendFile(path.join(frontendPublicPath, 'order.html'));
    });

    // --- Serve other static assets (CSS, JS, images, etc.) ---
    app.use(express.static(frontendPublicPath));

    // --- SPA Fallback / Handle root and any unmatched routes ---
    app.get('*', (req, res) => {
        if (req.path === '/') {
            return res.sendFile(path.join(frontendPublicPath, 'login.html'));
        }
        res.sendFile(path.join(frontendPublicPath, 'index.html'));
    });


    const PORT = config.port;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    