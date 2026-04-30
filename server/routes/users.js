const express = require("express");
const User = require("../models/User");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const Generation = require("../models/Generation");
const TokenTransaction = require("../models/TokenTransaction");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/profile/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const prompts = await Prompt.find({ creator: user._id, status: "approved" }).populate("creator", "name avatar").sort({ createdAt: -1 });
    res.json({ user, prompts });
  } catch (e) { next(e); }
});

router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    ["name", "avatar", "bio", "skills", "socialLinks"].forEach((key) => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
    await req.user.save();
    res.json({ user: req.user });
  } catch (e) { next(e); }
});

router.get("/library", requireAuth, async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ buyer: req.user._id }).populate({ path: "prompt", populate: { path: "creator", select: "name avatar" } }).sort({ createdAt: -1 });
    res.json({ prompts: purchases.map((p) => p.prompt), purchases });
  } catch (e) { next(e); }
});

router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const [purchases, generations, transactions, prompts] = await Promise.all([
      Purchase.find({ buyer: req.user._id }).populate("prompt").sort({ createdAt: -1 }).limit(10),
      Generation.find({ user: req.user._id }).populate("prompt").sort({ createdAt: -1 }).limit(10),
      TokenTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
      Prompt.find({ creator: req.user._id }).sort({ createdAt: -1 }),
    ]);
    res.json({ user: req.user, purchases, generations, transactions, prompts, stats: { promptsOwned: purchases.length, generationsRun: generations.length, tokensSpent: purchases.reduce((s, p) => s + (p.tokensSpent || 0), 0), livePrompts: prompts.filter((p) => p.status === "approved").length, totalSales: prompts.reduce((s, p) => s + p.salesCount, 0) } });
  } catch (e) { next(e); }
});

router.get("/transactions", requireAuth, async (req, res, next) => {
  try { res.json({ transactions: await TokenTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.post("/follow/:id", requireAuth, async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    const has = target.followers.some((id) => String(id) === String(req.user._id));
    target.followers = has ? target.followers.filter((id) => String(id) !== String(req.user._id)) : [...target.followers, req.user._id];
    await target.save();
    res.json({ following: !has, followers: target.followers.length });
  } catch (e) { next(e); }
});

module.exports = router;
