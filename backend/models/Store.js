const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    logoUrl: { type: String, default: null }, // Added this field for the logo
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', StoreSchema);