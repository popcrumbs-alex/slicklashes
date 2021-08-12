const mongoose = require("mongoose");

const InventorySchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  stockAmt: {
    type: String,
    required: true,
  },
  itemPrice: {
    type: String,
    required: true,
  },
});

module.exports = InventoryItem = mongoose.model("inventory", InventorySchema);
