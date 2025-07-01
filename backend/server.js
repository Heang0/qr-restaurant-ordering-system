const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path'); // Import the 'path' module for directory resolution
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
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS for all origins (you might want to restrict this in production)

// --- API Routes ---
// These routes should come first to ensure API requests are handled before static file serving
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoriesRoutes);

// --- Serve static frontend assets ---
// This tells Express to serve static files from the 'frontend/public' directory.
// path.join(__dirname, '..', 'frontend', 'public') resolves to:
// current_directory_of_server.js/../frontend/public
// which correctly points to your frontend/public folder from the backend folder.
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// --- SPA Fallback / Serve index.html for all other routes ---
// For any GET request that doesn't match an API route or a static file,
// serve the 'index.html' file. This is crucial for client-side routing
// and ensuring direct access to frontend pages (like /order.html) works.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'public', 'index.html'));
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

