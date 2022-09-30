const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WaitingList = new Schema(
  {
    name: { type: String },
    numberOfpeople: { type: Number },
    phone: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("WaitingList", WaitingList);
