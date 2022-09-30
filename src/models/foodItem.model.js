const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FoodItem = new Schema(
  {
    title: { type: String },
    price: { type: Number },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FoodItem", FoodItem);
