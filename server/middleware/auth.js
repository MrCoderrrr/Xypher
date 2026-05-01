const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

const jwtSecret = process.env.JWT_SECRET || "xypher_jwt_secret_2024";
const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: "7d" });

const getUserFromToken = async (token) => {
  if (!token) return null;
  const decoded = jwt.verify(token, jwtSecret);
  return mongoose.connection.readyState === 1
    ? User.findById(decoded.id)
    : global.xypherUsers?.find((item) => String(item._id) === String(decoded.id));
};

const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const user = await getUserFromToken(token);
    if (!user) return res.status(401).json({ message: "Invalid token" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

const attachOptionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";
    req.user = token ? await getUserFromToken(token) : null;
  } catch {
    req.user = null;
  }
  next();
};

const isAdmin = (req, res, next) => (req.user?.role === "admin" ? next() : res.status(403).json({ message: "Admin access required" }));
const isCreator = (req, res, next) => (["creator", "admin"].includes(req.user?.role) ? next() : res.status(403).json({ message: "Creator access required" }));

module.exports = { requireAuth, attachOptionalAuth, isAdmin, isCreator, signToken };
