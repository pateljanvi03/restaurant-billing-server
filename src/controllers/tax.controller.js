const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const Tax = require("../models/tax.model");
const auth = require("../middleware/auth");
const { body } = require("express-validator");

const taxValidations = {
  createOrUpdate: [
    body("title").notEmpty().isString(),
    body("percentage").notEmpty().isNumeric(),
  ],
};

router.get("/taxes", auth.userAuth, async (req, res) => {
  try {
    const tax = await Tax.find();
    return res.status(200).json(tax);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.get("/taxes/:id", auth.userAuth, async (req, res) => {
  try {
    const tax = await Tax.findOne({ _id: req.params.id });
    return res.status(200).json(tax);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.post(
  "/taxes",
  auth.userAuth,
  validate(taxValidations.createOrUpdate),
  async (req, res) => {
    try {
      const tax = await Tax.create(req.body);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.put(
  "/taxes/:id",
  auth.userAuth,
  validate(taxValidations.createOrUpdate),
  async (req, res) => {
    try {
      const tax = await Tax.updateOne({ _id: req.params.id }, req.body);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.delete("/taxes/:id", auth.userAuth, async (req, res) => {
  try {
    const tax = await Tax.deleteOne({ _id: req.params.id });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
