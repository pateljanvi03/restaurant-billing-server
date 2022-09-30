const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Order = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    tableId: { type: Schema.Types.ObjectId, ref: "Table" },
    total: { type: Number, default: 0 },
    discount: { type: Object },
    netAmount: { type: Number, default: 0 },
    taxes: { type: Object },
    billAmount: { type: Number, default: 0 },
    isPaid: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", Order);
