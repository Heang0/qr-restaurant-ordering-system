const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    isBestSeller: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true } // CITE: This field was missing in your uploaded MenuItem.js
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);