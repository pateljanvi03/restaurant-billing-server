const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Category = new Schema(
  {
    title: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("category", Category);
