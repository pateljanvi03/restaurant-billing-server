const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");

const auth = require("../middleware/auth");
const Category = require("../models/category.model");
const { body } = require("express-validator");

const categoryValidations = {
  createOrUpdate: [body("title").isString().not().isEmpty()],
};

router.get("/categories", auth.userAuth, async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.get("/categories/:id", auth.userAuth, async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id });
    res.status(200).json(category);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.post(
  "/categories",
  validate(categoryValidations.createOrUpdate),
  auth.userAuth,
  async (req, res) => {
    try {
      const category = await Category.create(req.body);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.put(
  "/categories/:id",
  validate(categoryValidations.createOrUpdate),
  auth.userAuth,
  async (req, res) => {
    try {
      const category = await Category.updateOne(
        { _id: req.params.id },
        req.body
      );
      res.status(200).json(category);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.delete("/categories/:id", auth.userAuth, async (req, res) => {
  try {
    const category = await Category.deleteOne({ _id: req.params.id });
    res.status(200).json(category);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
