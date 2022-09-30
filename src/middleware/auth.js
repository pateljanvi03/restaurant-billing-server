const salt = process.env.JWT_SALT;
const jwt = require("jsonwebtoken");

function userAuth(req, res, next) {
  let user;
  if (req.headers.authorization == undefined) {
    return res.status(401).send({ message: "Invalid Token" });
  }

  try {
    const decoded = jwt.verify(req.headers.authorization.split(" ")[1], salt);
    user = decoded.user;

    req.authUser = user;
  } catch (e) {
    console.error(e);
    return res.status(401).send({ message: "Invalid Token" });
  }

  next();
}

module.exports = {
  salt,
  userAuth,
};
