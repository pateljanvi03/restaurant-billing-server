const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");
const { body } = require("express-validator");
const dayjs = require("dayjs");

const auth = require("../middleware/auth");
const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const Table = require("../models/table.model");

const orderValidation = {
  putItem: [
    body("items").isArray().isLength({ min: 1 }),
    body("items.*.itemId").isString(),
    body("items.*.orderId").isString(),
    body("items.*.quantity").isInt(),
    body("items.*.price").isInt(),
    body("items.*.subTotal").isInt(),
  ],
  paybill: [
    body("total").isNumeric().not().isEmpty(),
    body("discount").not().isEmpty(),
    body("netAmount").isNumeric().not().isEmpty(),
    body("taxes").not().isEmpty(),
    body("billAmount").isNumeric().not().isEmpty(),
  ],
};

router.get("/orders", auth.userAuth, async (req, res) => {
  try {
    let limit = parseInt(req.query.limit || 10);
    let page = req.query.page || 1;
    let skip = (page - 1) * limit;
    let orders = await Order.find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 })
      .exec();

    orders = orders.map((x) => {
      const data = x.toJSON();
      data.date = dayjs(x.createdAt).format("DD/MM/YYYY");
      return data;
    });

    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.put(
  "/orders/:id",
  validate(orderValidation.putItem),
  auth.userAuth,
  async (req, res) => {
    try {
      const orderItem = await OrderItem.create(req.body.items);
      let sum = 0;
      for (i = 0; i < req.body.items.length; i++) {
        sum += req.body.items[i].subTotal;
      }
      await Order.updateOne({ _id: req.params.id }, { $inc: { total: sum } });

      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ msg: err?.message });
    }
  }
);

router.put(
  "/orders/:id/paybill",
  validate(orderValidation.paybill),
  auth.userAuth,
  async (req, res) => {
    try {
      await Order.updateOne(
        { _id: req.params.id },
        {
          isPaid: true,
          total: req.body.total,
          discount: req.body.discount,
          netAmount: req.body.netAmount,
          taxes: req.body.taxes,
          billAmount: req.body.billAmount,
        }
      );

      const order = await Order.findOne({ _id: req.params.id });
      const table = await Table.updateOne(
        { _id: order.tableId },
        { isEmpty: true }
      );

      res.status(200).json(table);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ msg: err?.message });
    }
  }
);

router.get("/orders/:id/items", auth.userAuth, async (req, res) => {
  try {
    const orderItem = await OrderItem.find({ orderId: req.params.id });
    res.status(200).json(orderItem);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.get("/stats/orders-amount/:type", auth.userAuth, async (req, res) => {
  try {
    let endDate = dayjs().add(1, "day");
    let startDate;

    const type = req.params.type; // weekly, daily, monthly

    if (type == "weekly") {
      startDate = dayjs().subtract(1, "week");
    } else if (type == "monthly") {
      startDate = dayjs().subtract(1, "month");
    } else {
      startDate = dayjs().subtract(1, "day");
    }

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate.toDate(),
            $lt: endDate.toDate(),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$total",
          },
        },
      },
    ]);

    const totalAmount = data[0]?.total || 0;
    console.log(totalAmount);
    return res.json({ totalAmount });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.get("/stats/orders-count/:duration", auth.userAuth, async (req, res) => {
  try {
    let endDate = dayjs().add(1, "day");
    let startDate;

    const duration = req.params.duration;

    if (duration == "weekly") {
      startDate = dayjs().subtract(1, "week");
    } else if (duration == "monthly") {
      startDate = dayjs().subtract(1, "month");
    } else {
      startDate = dayjs().subtract(1, "day");
    }

    const count = await Order.countDocuments({
      createdAt: { $gte: startDate.toDate(), $lt: endDate.toDate() },
    });

    return res.json({ count });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

function getTimeRangeQuery(duration) {
  if (duration == "weekly") {
    duration = "week";
  } else if (duration == "daily") {
    duration = "day";
  } else {
    duration = "month";
  }

  let endDate = dayjs().add(1, "day");
  let startDate = dayjs().subtract(1, duration);

  return {
    $match: {
      createdAt: {
        $gte: startDate.toDate(),
        $lt: endDate.toDate(),
      },
    },
  };
}

router.get(
  "/stats/orders-count-by-date/:duration",
  auth.userAuth,
  async (req, res) => {
    try {
      const match = getTimeRangeQuery(req.params.duration);

      const result = await Order.aggregate([
        match,
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      return res.json({ result });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.get(
  "/stats/orders-revenue-by-date/:duration",
  auth.userAuth,
  async (req, res) => {
    try {
      const match = getTimeRangeQuery(req.params.duration);

      const result = await Order.aggregate([
        match,
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: {
              $sum: "$total",
            },
          },
        },
      ]);

      let startDate = dayjs().subtract(1, "week").add(1, "day");
      let graphData = [];
      for (let index = 0; index < 7; index++) {
        let indexDate = result.findIndex(
          (x) => x._id == startDate.format("YYYY-MM-DD")
        );
        if (indexDate == -1) {
          graphData.push({ _id: startDate.format("YYYY-MM-DD"), total: 0 });
        } else {
          graphData.push(result[indexDate]);
        }
        startDate = startDate.add(1, "day");
      }

      return res.json({ result: graphData });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.get("/stats/orders/top-items", auth.userAuth, async (req, res) => {
  try {
    const revenue = await OrderItem.aggregate([
      {
        $group: {
          _id: {
            itemId: "$itemId",
          },
          revenue: {
            $sum: "$subTotal",
          },
          quantity: {
            $sum: "$quantity",
          },
        },
      },
      {
        $sort: {
          quantity: -1,
        },
      },
    ]);
    return res.status(200).json({ revenue });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
