const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const signToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET || "xypher_jwt_secret_2024", { expiresIn: "7d" });

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "xypher_jwt_secret_2024");
    const user = mongoose.connection.readyState === 1
      ? await User.findById(decoded.id)
      : global.xypherUsers?.find((item) => String(item._id) === String(decoded.id));
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const isAdmin = (req, res, next) => (req.user?.role === "admin" ? next() : res.status(403).json({ message: "Admin access required" }));
const isCreator = (req, res, next) => (["creator", "admin"].includes(req.user?.role) ? next() : res.status(403).json({ message: "Creator access required" }));

module.exports = { requireAuth, isAdmin, isCreator, signToken };
