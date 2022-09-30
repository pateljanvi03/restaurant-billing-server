const bodyParser = require("body-parser");
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const connect = require("./config/db");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userController = require("./controllers/user.controller");
const tableController = require("./controllers/table.controller");
const categoryController = require("./controllers/category.controller");
const ItemController = require("./controllers/foodItem.controller");
const OrderController = require("./controllers/order.controller");
const WaitingListController = require("./controllers/waitingList.controller");
const TaxController = require("./controllers/tax.controller");

const port = process.env.PORT || "5000";

app.use(cors());

app.get("/", function (req, res) {
  return res.send("Hello!");
});

app.use("/", userController);
app.use("/", tableController);
app.use("/", categoryController);
app.use("/", ItemController);
app.use("/", OrderController);
app.use("/", WaitingListController);
app.use("/", TaxController);

const start = () => {
  connect().then(() => {
    console.log("Connected to mongodb");

    app.listen(port, () => {
      console.log("listening on port " + port);
    });
  });
};

module.exports = { start, app };
