const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");

const auth = require("../middleware/auth");
const FoodItem = require("../models/foodItem.model");
const { body } = require("express-validator");

const itemsValidations = {
  createOrUpdate: [
    body("title").isString().not().isEmpty(),
    body("price").not().isInt().not().isEmpty(),
    body("categoryId").isString().not().isEmpty(),
  ],
};

router.get("/fooditems", auth.userAuth, async (req, res) => {
  try {
    const items = await FoodItem.find();
    res.status(200).json(items);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.get("/fooditems/:id", auth.userAuth, async (req, res) => {
  try {
    const item = await FoodItem.find({ _id: req.params.id });
    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.post(
  "/fooditems",
  validate(itemsValidations.createOrUpdate),
  auth.userAuth,
  async (req, res) => {
    try {
      const item = await FoodItem.create(req.body);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.put(
  "/fooditems/:id",
  validate(itemsValidations.createOrUpdate),
  auth.userAuth,
  async (req, res) => {
    try {
      const item = await FoodItem.updateOne({ _id: req.params.id }, req.body);
      res.status(200).json(item);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.delete("/fooditems/:id", auth.userAuth, async (req, res) => {
  try {
    const item = await FoodItem.deleteOne({ _id: req.params.id });
    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
