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

// --- ULTIMATE DEBUGGING LOGGING ---
// This middleware will log ALL incoming requests to the backend.
app.use((req, res, next) => {
    console.log(`[INCOMING REQUEST] Method: ${req.method}, Path: ${req.path}, OriginalUrl: ${req.originalUrl}, Query: ${JSON.stringify(req.query)}, Headers: ${JSON.stringify(req.headers.host)}`);
    next(); // Pass control to the next middleware/route handler
});


// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoriesRoutes);

// --- Backend Root Route ---
app.get('/', (req, res) => {
    res.send('QR Restaurant Ordering System Backend API is running.');
});

// --- 404 Handler for unmatched routes ---
app.use((req, res, next) => {
    console.log(`[404] No route matched: ${req.method} ${req.originalUrl}`);
    res.status(404).send('Not Found: This server only hosts the API.');
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
