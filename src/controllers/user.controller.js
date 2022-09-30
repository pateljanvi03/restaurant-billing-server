const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const ObjectId = mongoose.Types.ObjectId;

const Token = require("../models/token.model.js");
const User = require("../models/user.model");
const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const { body, validationResult } = require("express-validator");

const userValidations = {
  create: [
    body("password").not().isEmpty(),
    body("userName").not().isEmpty(),
    body("name").not().isEmpty(),
    body("userName").custom((x) => {
      return User.findOne({ userName: x }).then((user) => {
        if (user) {
          return Promise.reject("Username already in use");
        }
      });
    }),
  ],
  login: [body("password").not().isEmpty(), body("userName").not().isEmpty()],
  update: [
    body("userName").not().isEmpty(),
    body("name").not().isEmpty(),
    body("userName").custom((x, { req }) => {
      return User.findOne({ userName: x }).then((user) => {
        if (user && req.params.id != user._id) {
          return Promise.reject("Username already in use");
        }
      });
    }),
  ],
};

router.post(
  "/users/login",
  validate(userValidations.login),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await User.findOne({ userName: req.body.userName });
      if (user == null) {
        return res.status(400).json({ message: "user not found" });
      }
      const isMatch = await bcrypt.compare(req.body.password, user.password);

      if (!isMatch) {
        res.status(400).json({ message: "password is wrong" });
      } else {
        jwt.sign(
          {
            user: {
              _id: user._id,
              userName: user.userName,
            },
          },
          auth.salt,
          {
            expiresIn: 10000,
          },
          (err, token) => {
            if (err) throw err;
            Token.create({ token: token });
            res.status(200).json({
              token,
            });
          }
        );
      }
    } catch (err) {
      console.error(err);
      return res.status(400).json({ msg: err?.message });
    }
  }
);

router.delete("/users/logout/:token", auth.userAuth, async (req, res) => {
  try {
    await Token.deleteOne({ token: req.params.token });
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err?.message });
  }
});

router.get("/users", auth.userAuth, async (req, res) => {
  try {
    const users = await User.find();
    let response = users.map((x) => {
      let data = x.toJSON();
      delete data.password;
      return data;
    });
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.get("/users/:id", auth.userAuth, async (req, res) => {
  try {
    const response = await User.findOne({ _id: req.params.id });
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

router.post(
  "/users",
  validate(userValidations.create),
  auth.userAuth,
  async (req, res) => {
    try {
      const user = req.body;
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await User.create(user);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.put(
  "/users/:id",
  validate(userValidations.update),
  auth.userAuth,
  async (req, res) => {
    try {
      if (req.body.password == "") {
        delete req.body.password;
      } else {
        req.body.password = await bcrypt.hash(req.body.password, auth.salt);
      }
      const user = await User.updateOne({ _id: req.params.id }, req.body);
      res.status(200).json(user);
    } catch (err) {
      console.error(err);
      return res.status(400).json({ message: err?.message });
    }
  }
);

router.delete("/users/:id", auth.userAuth, async (req, res) => {
  try {
    const users = await User.deleteOne({ _id: req.params.id });
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(400).json({ message: err?.message });
  }
});

module.exports = router;
