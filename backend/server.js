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
// Keep this for debugging if needed, it logs requests that hit /api
app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware/route handler
});

// --- API Routes ---
// These routes MUST come before any static file serving or HTML file serving
// to ensure API requests are handled first.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoriesRoutes);

// Define the absolute path to your frontend public directory
const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');

// --- Explicitly serve HTML files ---
// These routes should come AFTER API routes but BEFORE general express.static
// to ensure specific HTML files are served directly.
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
// This will serve all other files from the 'public' directory.
// It comes AFTER specific HTML files and API routes.
app.use(express.static(frontendPublicPath));

// --- SPA Fallback / Handle root and any unmatched routes ---
// For the root URL, we explicitly serve login.html.
// For any other unmatched path, we serve index.html (as a fallback for client-side routing).
app.get('*', (req, res) => {
    if (req.path === '/') {
        return res.sendFile(path.join(frontendPublicPath, 'login.html'));
    }
    // If it's not a specific HTML file path or API path, and not '/',
    // then it's a client-side route, so serve index.html
    res.sendFile(path.join(frontendPublicPath, 'index.html'));
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
