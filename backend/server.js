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

// --- API Routes (STILL COMMENTED OUT FOR NOW - will uncomment later) ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/stores', storeRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/tables', tableRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/categories', categoriesRoutes);

// --- Serve static frontend assets ---
// This should be placed before any wildcard routes or API routes that might
// accidentally intercept requests for static files.
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// --- Explicit Root Route for Frontend ---
// Handle the root path explicitly to serve index.html.
// This often resolves ambiguities with path-to-regexp.
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'public', 'login.html')); // Assuming login.html is your entry point
});

// --- SPA Fallback for other frontend routes ---
// For any other GET request that doesn't match a static file or the explicit root,
// serve index.html. This is for client-side routing (e.g., /admin.html, /order.html etc.)
// that might be directly accessed or navigated to.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'public', 'index.html'));
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
