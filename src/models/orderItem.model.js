const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderItem = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    itemId: { type: Schema.Types.ObjectId, ref: "FoodItem" },
    quantity: { type: Number },
    price: { type: Number },
    subTotal: { type: Number },
    tableId: { type: Schema.Types.ObjectId, ref: "Table" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OrderItem", OrderItem);
