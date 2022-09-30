const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Table = new Schema(
  {
    tableNo: { type: String },
    capacity: { type: Number, required: false },
    sequence: { type: Number, required: true },
    isEmpty: { type: Boolean, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Table", Table);
