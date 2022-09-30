const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { body } = require("express-validator");

const auth = require("../middleware/auth");
const WaitingList = require("../models/waitingList.model");

const waitinglistValidations = {
  createOrUpdate: [
    body("name").isString(),
    body("numberOfpeople").isInt(),
    body("phone").isString(),
  ],
};

router.get("/waiting-list", auth.userAuth, async (req, res) => {
  try {
    const waitingList = await WaitingList.find();

    res.status(200).json(waitingList);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err?.message });
  }
});

router.post(
  "/waiting-list",
  validate(waitinglistValidations.createOrUpdate),
  auth.userAuth,
  async (req, res) => {
    try {
      const list = await WaitingList.create(req.body);
      res.status(200).json(list);
    } catch (err) {
      console.error(err);
      res.status(400).json({ message: err?.message });
    }
  }
);

router.delete("/waiting-list/:id", auth.userAuth, async (req, res) => {
  try {
    await WaitingList.deleteOne({ _id: req.params.id });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
