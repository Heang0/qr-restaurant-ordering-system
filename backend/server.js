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

// --- API Routes (COMMENTED OUT FOR DEBUGGING) ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/stores', storeRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/tables', tableRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/categories', categoriesRoutes);

// --- Serve static frontend assets (COMMENTED OUT FOR DEBUGGING) ---
// app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// --- SPA Fallback / Serve index.html for all other routes (COMMENTED OUT FOR DEBUGGING) ---
// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '..', 'frontend', 'public', 'index.html'));
// });

// Minimal test route
app.get('/test-server-start', (req, res) => {
    res.send('Server started successfully!');
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
