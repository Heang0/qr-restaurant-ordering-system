const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
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
app.use(cors());

// --- NEW: API Request Logger Middleware ---
// This logs requests that hit /api
app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware/route handler
});

// --- API Routes (MUST BE FIRST AND EXPLICITLY HANDLED) ---
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
// These routes are defined BEFORE the general static middleware
// to ensure they are served directly and not intercepted.
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
// This middleware will serve all other files from the 'public' directory.
// It comes AFTER explicit HTML routes and all API routes.
// The key is that it will ONLY be hit if the request URL does NOT match
// an API route or one of the explicitly defined HTML files above.
app.use(express.static(frontendPublicPath));

// --- SPA Fallback / Handle root and any unmatched routes ---
// This is the final catch-all.
app.get('*', (req, res) => {
    // If the request is for the root path, serve login.html
    if (req.path === '/') {
        return res.sendFile(path.join(frontendPublicPath, 'login.html'));
    }
    // For any other path not caught by previous routes (including client-side routes),
    // serve index.html.
    res.sendFile(path.join(frontendPublicPath, 'index.html'));
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
