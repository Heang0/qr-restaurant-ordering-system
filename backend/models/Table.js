const mongoose = require('mongoose');

const TableSchema = new mongoose.Schema({
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    tableId: { type: String, required: true } // e.g., "A1", "B2"
});

module.exports = mongoose.model('Table', TableSchema);