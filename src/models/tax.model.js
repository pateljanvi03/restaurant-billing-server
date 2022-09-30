const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Tax = new Schema(
  {
    title: { type: String },
    percentage: { type: Number },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Tax", Tax);
