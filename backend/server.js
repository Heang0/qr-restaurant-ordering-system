const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores'); // Corrected path
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
app.use(cors());

// --- NEW: API Request Logger Middleware ---
// Keep this for debugging if needed, it logs requests that hit /api
app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware/route handler
});

// --- API Routes ---
// These routes MUST come before any static file serving for the root path
// or wildcard routes to ensure API requests are handled first.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoriesRoutes);

// Define the absolute path to your frontend public directory
const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');

// --- Serve static assets (CSS, JS, images) for non-API paths ---
// This is the CRITICAL CHANGE: Only serve static files if the path does NOT start with /api.
// This prevents express.static from intercepting API calls.
app.use((req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
        return next(); // Skip static middleware for API calls
    }
    express.static(frontendPublicPath)(req, res, next);
});


// --- Handle all other GET requests (including root and frontend routes) ---
// This is the SPA fallback. It will serve the appropriate HTML file.
// For the root URL, we explicitly serve login.html.
// For any other path, we serve index.html, and the frontend JS handles routing.
app.get('*', (req, res) => {
    // If the request is for the root path, serve login.html
    if (req.path === '/') {
        return res.sendFile(path.join(frontendPublicPath, 'login.html'));
    }
    // For any other path, serve index.html (which will then redirect or load content)
    res.sendFile(path.join(frontendPublicPath, 'index.html'));
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
