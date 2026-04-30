const express = require("express");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const { requireAuth, signToken } = require("../middleware/auth");

const router = express.Router();
const clean = (user) => ({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role, tokenBalance: user.tokenBalance, isCreator: user.isCreator });
const slug = (value) => String(value || "user").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
global.xypherUsers = global.xypherUsers || [];

router.post("/register", async (req, res, next) => {
  try {
    console.log("[Auth Debug] Registration attempt:", { body: req.body });
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const role = req.body.role || "buyer";

    console.log("[Auth Debug] Parsed values:", { name: name || "(empty)", email: email || "(empty)", passwordLength: password.length, role });

    if (!name || !email || !password) {
      console.log("[Auth Debug] Validation failed: Missing fields");
      return res.status(400).json({ message: "Missing fields", details: { name: !name, email: !email, password: !password } });
    }
    if (password.length < 6) {
      console.log("[Auth Debug] Validation failed: Password too short");
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!["buyer", "creator"].includes(role)) {
      console.log("[Auth Debug] Validation failed: Invalid role");
      return res.status(400).json({ message: "Invalid role" });
    }
    if (mongoose.connection.readyState !== 1) {
      console.log("[Auth Debug] MongoDB not connected, using in-memory storage");
      const exists = global.xypherUsers.find((user) => user.email === email);
      if (exists) {
        console.log("[Auth Debug] User already exists in memory:", email);
        return res.status(409).json({ message: "Email already registered" });
      }
      const user = {
        _id: `dev_${Date.now()}`,
        name,
        email,
        password: await bcrypt.hash(password, 10),
        role,
        isCreator: role === "creator",
        tokenBalance: 100,
      };
      global.xypherUsers.push(user);
      console.log("[Auth Debug] User created in memory:", email);
      return res.status(201).json({ token: signToken(user), user: clean(user) });
    }

    console.log("[Auth Debug] MongoDB connected, checking for existing user");
    const exists = await User.findOne({ email });
    if (exists) {
      console.log("[Auth Debug] User already exists in DB:", email);
      return res.status(409).json({ message: "Email already registered" });
    }

    const suffix = Date.now().toString(36);
    console.log("[Auth Debug] Creating user in DB...");
    const user = await User.create({
      name,
      email,
      username: `${slug(name)}-${suffix}`,
      clerkId: `local:${email}:${suffix}`,
      password: await bcrypt.hash(password, 10),
      role,
      isCreator: role === "creator",
      tokenBalance: 100,
    });
    console.log("[Auth Debug] User created successfully:", email);
    res.status(201).json({ token: signToken(user), user: clean(user) });
  } catch (e) {
    console.error("[Auth Debug] Registration error:", e.message);
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const user = mongoose.connection.readyState === 1
      ? await User.findOne({ email }).select("+password")
      : global.xypherUsers.find((item) => item.email === email);
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password))) return res.status(401).json({ message: "Invalid credentials" });
    res.json({ token: signToken(user), user: clean(user) });
  } catch (e) { next(e); }
});

router.get("/me", requireAuth, (req, res) => res.json({ user: clean(req.user) }));

module.exports = router;
