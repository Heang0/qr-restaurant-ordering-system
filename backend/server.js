const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // Keep cors import
const path = require('path'); // Still needed if other modules use it, but not for static serving here
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

// --- Explicit CORS Configuration (REQUIRED for separate deployments) ---
// Allow requests only from your specific frontend domain.
const corsOptions = {
    origin: 'https://qr-restaurant-ordering-system-1.onrender.com', // **IMPORTANT: Replace with your actual Frontend Static Site URL**
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent (if your auth uses them)
    optionsSuccessStatus: 204 // For preflight requests
};
app.use(cors(corsOptions));


// --- API Request Logger Middleware (Optional, good for debugging) ---
app.use('/api', (req, res, next) => {
    console.log(`API Request: ${req.method} ${req.originalUrl}`);
    next();
});

// --- API Routes ---
// These are the ONLY routes this server will handle.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoriesRoutes);

// --- No static file serving or wildcard routes here ---
// This server will NOT serve HTML, CSS, JS files directly.
// It will only respond to /api/* requests.
app.get('/', (req, res) => {
    res.send('QR Restaurant Ordering System Backend API is running.');
});

// Optional: Add a 404 handler for any non-API routes that fall through
app.use((req, res, next) => {
    if (!req.originalUrl.startsWith('/api')) {
        return res.status(404).send('Not Found: This server only hosts the API.');
    }
    next();
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
