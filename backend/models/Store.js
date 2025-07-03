const mongoose = require('mongoose');

const StoreSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    // ADDED THIS LINE: Slug field for URL-friendly store name
    slug: { type: String, unique: true, sparse: true }, // sparse: true allows null values for non-slugged stores
    logoUrl: { type: String, default: null },
    address: { type: String },
    phone: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Store', StoreSchema);