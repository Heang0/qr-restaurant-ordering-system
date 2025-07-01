const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const menuRoutes = require('./routes/menu'); // Keep this import
const tableRoutes = require('./routes/tables');
const orderRoutes = require('./routes/orders'); // Keep this import
const categoriesRoutes = require('./routes/categories');

const app = express();

// Connect to MongoDB
mongoose.connect(config.mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(cors());

// --- API Routes (ONLY MENU AND ORDERS PUBLIC ROUTES RE-ENABLED FOR TESTING) ---
// Temporarily comment out all other API routes to isolate the problem.
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/stores', storeRoutes);

// ONLY re-enable the menu and orders routes that the customer page uses
app.use('/api/menu', menuRoutes); // This includes /api/menu/public
app.use('/api/orders', orderRoutes); // This includes /api/orders/customer

// app.use('/api/tables', tableRoutes); // Commented out
// app.use('/api/categories', categoriesRoutes); // Commented out


// Define the absolute path to your frontend public directory
const frontendPublicPath = path.join(__dirname, '..', 'frontend', 'public');

// --- Serve static frontend assets (COMMENTED OUT FOR THIS TEST) ---
// app.use(express.static(frontendPublicPath));

// --- Explicit Root Route for Frontend (COMMENTED OUT FOR THIS TEST) ---
// app.get('/', (req, res) => {
//     res.sendFile(path.join(frontendPublicPath, 'login.html'));
// });

// --- SPA Fallback for other frontend routes (COMMENTED OUT FOR THIS TEST) ---
// app.get('*', (req, res) => {
//     res.sendFile(path.join(frontendPublicPath, 'index.html'));
// });

// Add a simple test route for the root to confirm server is up
app.get('/', (req, res) => {
    res.send('Backend API is running. Test menu public endpoint at /api/menu/public?storeId=<your_store_id>');
});


const PORT = config.port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
