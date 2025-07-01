const express = require('express');
// const mongoose = require('mongoose'); // Commented out
// const cors = require('cors'); // Commented out
// const path = require('path'); // Commented out
const config = require('./config'); // Still need config for PORT

// Commented out all route imports
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const storeRoutes = require('./routes/stores');
// const menuRoutes = require('./routes/menu');
// const tableRoutes = require('./routes/tables');
// const orderRoutes = require('./routes/orders');
// const categoriesRoutes = require('./routes/categories');

const app = express();

// Connect to MongoDB (COMMENTED OUT FOR DEBUGGING)
// mongoose.connect(config.mongoURI)
//     .then(() => console.log('MongoDB connected'))
//     .catch(err => console.error('MongoDB connection error:', err));

// Middleware (COMMENTED OUT FOR DEBUGGING)
// app.use(express.json());
// app.use(cors());

// --- API Routes (ALL COMMENTED OUT) ---
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/stores', storeRoutes);
// app.use('/api/menu', menuRoutes);
// app.use('/api/tables', tableRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/categories', categoriesRoutes);

// --- Serve static frontend assets (COMMENTED OUT) ---
// app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// --- SPA Fallback / Serve index.html for all other routes (COMMENTED OUT) ---
// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '..', 'frontend', 'public', 'index.html'));
// });

// Simple root route to confirm server starts
app.get('/', (req, res) => {
    res.send('Minimal server started successfully!');
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
