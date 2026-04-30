const express = require("express");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const Review = require("../models/Review");
const User = require("../models/User");
const TokenTransaction = require("../models/TokenTransaction");
const { requireAuth, isCreator } = require("../middleware/auth");

const router = express.Router();

router.get("/categories", async (req, res, next) => {
  try {
    const categories = await Prompt.distinct("category", { status: "approved" });
    res.json({ categories: categories.filter(Boolean).sort() });
  } catch (e) { next(e); }
});

router.get("/", async (req, res, next) => {
  try {
    const { category, search, sort = "newest", page = 1, limit = 9, status } = req.query;
    const filter = { status: status || "approved" };
    if (category) filter.category = category;
    if (search) filter.$or = [{ title: new RegExp(search, "i") }, { description: new RegExp(search, "i") }, { tags: new RegExp(search, "i") }];
    const sortMap = { newest: { createdAt: -1 }, popular: { salesCount: -1 }, rated: { rating: -1 }, priceLow: { price: 1 }, priceHigh: { price: -1 } };
    const total = await Prompt.countDocuments(filter);
    const prompts = await Prompt.find(filter).populate("creator", "name avatar role followers").sort(sortMap[sort] || sortMap.newest).skip((page - 1) * limit).limit(Number(limit));
    res.json({ prompts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

router.post("/", requireAuth, isCreator, async (req, res, next) => {
  try {
    const prompt = await Prompt.create({
      ...req.body,
      creator: req.user._id,
      ownerName: req.user.name || req.user.email,
      status: "pending",
    });
    res.status(201).json({ prompt });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id).populate("creator", "name avatar bio skills socialLinks totalPrompts totalSales avgRating followers createdAt");
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });
    res.json({ prompt });
  } catch (e) { next(e); }
});

router.patch("/:id", requireAuth, isCreator, async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });
    if (req.user.role !== "admin" && String(prompt.creator) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
    Object.assign(prompt, req.body, { status: req.user.role === "admin" ? req.body.status || prompt.status : "pending" });
    await prompt.save();
    res.json({ prompt });
  } catch (e) { next(e); }
});

router.delete("/:id", requireAuth, isCreator, async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });
    if (req.user.role !== "admin" && String(prompt.creator) !== String(req.user._id)) return res.status(403).json({ message: "Forbidden" });
    await prompt.deleteOne();
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
});

router.post("/:id/purchase", requireAuth, async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    if (!prompt || prompt.status !== "approved") return res.status(404).json({ message: "Prompt not available" });
    if (String(prompt.creator) === String(req.user._id)) return res.status(400).json({ message: "Own prompt" });
    const existing = await Purchase.findOne({ buyer: req.user._id, prompt: prompt._id });
    if (existing) return res.json({ purchase: existing });
    if (req.user.tokenBalance < prompt.price) return res.status(402).json({ message: "Insufficient tokens" });
    req.user.tokenBalance -= prompt.price;
    const purchase = await Purchase.create({ buyer: req.user._id, prompt: prompt._id, tokensSpent: prompt.price });
    await Promise.all([
      req.user.save(),
      Prompt.findByIdAndUpdate(prompt._id, { $inc: { salesCount: 1 } }),
      User.findByIdAndUpdate(prompt.creator, { $inc: { totalEarnings: purchase.creatorEarnings, availableBalance: purchase.creatorEarnings } }),
      TokenTransaction.create({ user: req.user._id, type: "spend", amount: -prompt.price, referenceId: `purchase:${purchase._id}`, description: `Purchased ${prompt.title}` }),
    ]);
    res.status(201).json({ purchase, user: req.user });
  } catch (e) { next(e); }
});

router.post("/:id/like", requireAuth, async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    const has = prompt.likes.some((id) => String(id) === String(req.user._id));
    prompt.likes = has ? prompt.likes.filter((id) => String(id) !== String(req.user._id)) : [...prompt.likes, req.user._id];
    await prompt.save();
    res.json({ liked: !has, likes: prompt.likes.length });
  } catch (e) { next(e); }
});

router.post("/:id/review", requireAuth, async (req, res, next) => {
  try {
    const bought = await Purchase.findOne({ buyer: req.user._id, prompt: req.params.id });
    if (!bought) return res.status(403).json({ message: "Purchase required" });
    const review = await Review.findOneAndUpdate({ reviewer: req.user._id, prompt: req.params.id }, { rating: req.body.rating, text: req.body.text }, { upsert: true, new: true, runValidators: true });
    const avg = await Review.aggregate([{ $match: { prompt: review.prompt } }, { $group: { _id: "$prompt", rating: { $avg: "$rating" }, count: { $sum: 1 } } }]);
    await Prompt.findByIdAndUpdate(req.params.id, { rating: avg[0]?.rating || 0, ratingCount: avg[0]?.count || 0 });
    res.json({ review });
  } catch (e) { next(e); }
});

router.get("/:id/reviews", async (req, res, next) => {
  try {
    const reviews = await Review.find({ prompt: req.params.id }).populate("reviewer", "name avatar").sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (e) { next(e); }
});

module.exports = router;
