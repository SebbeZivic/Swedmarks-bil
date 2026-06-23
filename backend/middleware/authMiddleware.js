const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Ingen token, access nekad" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token ogiltig", error: error.message });
  }
};

exports.isAdmin = (req, res, next) => {
  // authenticate() måste köras först
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Ingen token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const User = require("../models/User");

    User.findById(decoded.userId).then((user) => {
      if (!user || !user.isAdmin) {
        return res.status(403).json({ message: "Inte admin" });
      }
      req.userId = decoded.userId;
      next();
    });
  } catch (error) {
    res.status(401).json({ message: "Token ogiltig" });
  }
};
