const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wallet = new Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true },
  date: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Wallet", wallet);
