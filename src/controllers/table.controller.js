const express = require("express");
const router = express.Router();

const validate = require("../middleware/validate");
const auth = require("../middleware/auth");

const Table = require("../models/table.model");
const Order = require("../models/order.model");
const { body } = require("express-validator");

const tableValidations = {
  createOrUpdate: [
    body("tableNo").isString(),
    body("sequence").isInt(),
    body("isEmpty").isBoolean(),
    body("capacity").isInt(),
  ],
};

router.get("/tables", auth.userAuth, async (req, res) => {
  try {
    const tables = await Table.find();
    const orders = await Order.find({ isPaid: false });

    const response = await tables.map(function (x) {
      const data = x.toJSON();
      data.order = orders.find((y) => y.tableId.toString() == x._id.toString());

      return data;
    });

    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(200).json({ message: err?.message });
  }
});

router.get("/tables/:id", auth.userAuth, async (req, res) => {
  try {
    const table = await Table.findOne({ _id: req.params.id });
    res.status(200).json(table);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.put("/tables/:id/reserve-table", auth.userAuth, async (req, res) => {
  try {
    const table = await Table.updateOne(
      { _id: req.params.id },
      { isEmpty: false }
    );

    const order = await Order.create({
      tableId: req.params.id,
      total: 0,
      isPaid: false,
      userId: req.authUser._id,
    });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.post(
  "/tables",
  validate(tableValidations.createOrUpdate),
  auth.userAuth,
  async (req, res) => {
    try {
      const table = await Table.create(req.body);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.put(
  "/tables/:id",
  validate(tableValidations.createOrUpdate),
  auth.userAuth,
  async (req, res) => {
    try {
      const table = await Table.updateOne({ _id: req.params.id }, req.body);
      res.status(200).json(table);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.delete("/tables/:id", auth.userAuth, async (req, res) => {
  try {
    const table = await Table.deleteOne({ _id: req.params.id });
    res.status(200).json(table);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
