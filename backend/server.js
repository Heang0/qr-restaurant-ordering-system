const express = require('express');
const mongoose = require('mongoose'); // Re-enabled mongoose import
const cors = require('cors'); // Re-enabled cors import
const path = require('path'); // Import the 'path' module for directory resolution
const config = require('./config'); // Still need config for PORT

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const menuRoutes = require('./routes/menu');
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders');
const categoriesRoutes = require('./routes/categories');

const app = express();

// Connect to MongoDB (RE-ENABLED)
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware (RE-ENABLED)
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS for all origins (you might want to restrict this in production)

// --- API Routes (STILL COMMENTED OUT FOR NOW) ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/stores', storeRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/tables', tableRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/categories', categoriesRoutes);

// --- Serve static frontend assets (RE-ENABLED) ---
// This tells Express to serve static files from the 'frontend/public' directory.
// path.join(__dirname, '..', 'frontend', 'public') resolves to:
// current_directory_of_server.js/../frontend/public
// which correctly points to your frontend/public folder from the backend folder.
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// --- SPA Fallback / Serve index.html for all other routes (RE-ENABLED) ---
// For any GET request that doesn't match an API route or a static file,
// serve the 'index.html' file. This is crucial for client-side routing
// and ensuring direct access to frontend pages (like /order.html) works.
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '..', 'frontend', 'public', 'index.html'));
});

// Simple root route to confirm server starts (COMMENTED OUT)
// app.get('/', (req, res) => {
//     res.send('Minimal server started successfully!');
// });


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
