const Prompt = require("../models/Prompt");
const User = require("../models/User");
const Payout = require("../models/Payout");
const Purchase = require("../models/Purchase");
const Generation = require("../models/Generation");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const getOverview = asyncHandler(async (req, res) => {
  const [users, creators, prompts, pendingPrompts, pendingPayouts, purchases, generations] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isCreator: true }),
    Prompt.countDocuments(),
    Prompt.countDocuments({ status: "pending" }),
    Payout.countDocuments({ status: "pending" }),
    Purchase.find(),
    Generation.countDocuments(),
  ]);

  const platformEarnings = purchases.reduce((sum, purchase) => sum + purchase.platformEarnings, 0);

  return res.json({
    stats: {
      users,
      creators,
      prompts,
      pendingPrompts,
      pendingPayouts,
      generations,
      platformEarnings,
    },
  });
});

const listPrompts = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const prompts = await Prompt.find(filter).populate("creatorId", "username email creatorTier").sort({ createdAt: -1 });
  return res.json({ prompts });
});

const reviewPrompt = asyncHandler(async (req, res) => {
  const { status, adminNote } = req.body;

  if (!["approved", "rejected", "pending"].includes(status)) {
    return res.status(400).json({ message: "Invalid prompt status" });
  }

  const prompt = await Prompt.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });

  if (!prompt) {
    return res.status(404).json({ message: "Prompt not found" });
  }

  return res.json({ prompt });
});

const listCreators = asyncHandler(async (req, res) => {
  const creators = await User.find({ isCreator: true }).sort({ totalEarnings: -1, createdAt: -1 });
  return res.json({ creators });
});

const updateCreator = asyncHandler(async (req, res) => {
  const allowed = ["creatorTier", "isCreator", "isAdmin"];
  const updates = {};

  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const creator = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

  if (!creator) {
    return res.status(404).json({ message: "Creator not found" });
  }

  return res.json({ creator });
});

const listPayouts = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const payouts = await Payout.find(filter).populate("creatorId", "username email availableBalance").sort({ requestedAt: -1 });
  return res.json({ payouts });
});

const processPayout = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["processed", "failed"].includes(status)) {
    return res.status(400).json({ message: "Payout status must be processed or failed" });
  }

  const payout = await Payout.findById(req.params.id);

  if (!payout) {
    return res.status(404).json({ message: "Payout not found" });
  }

  if (payout.status !== "pending") {
    return res.status(400).json({ message: "Only pending payouts can be processed" });
  }

  payout.status = status;
  payout.processedAt = new Date();
  payout.adminNote = adminNote;
  await payout.save();

  if (status === "failed") {
    await User.findByIdAndUpdate(payout.creatorId, { $inc: { availableBalance: payout.amount } });
  }

  return res.json({ payout });
});

module.exports = {
  getOverview,
  listPrompts,
  reviewPrompt,
  listCreators,
  updateCreator,
  listPayouts,
  processPayout,
};
