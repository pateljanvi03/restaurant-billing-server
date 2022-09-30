const mongoose = require("mongoose");
require("dotenv").config();

const URI = process.env.MONGO_CONNECTION;

const connect = () => {
  return mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
};

module.exports = connect;
