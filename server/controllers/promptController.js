const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const TokenTransaction = require("../models/TokenTransaction");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const listPrompts = asyncHandler(async (req, res) => {
  const { category, q, creatorId, status } = req.query;
  const filter = {};

  if (req.user?.isAdmin && status) {
    filter.status = status;
  } else {
    filter.status = "approved";
  }

  if (category) filter.category = category;
  if (creatorId) filter.creatorId = creatorId;
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } },
    ];
  }

  const prompts = await Prompt.find(filter).populate("creatorId", "username avatar creatorTier").sort({ createdAt: -1 });
  return res.json({ prompts });
});

const getPrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id).populate("creatorId", "username avatar creatorTier totalEarnings");

  if (!prompt) {
    return res.status(404).json({ message: "Prompt not found" });
  }

  const canViewDraft =
    req.user?.isAdmin || (req.user && prompt.creatorId._id.toString() === req.user._id.toString());

  if (prompt.status !== "approved" && !canViewDraft) {
    return res.status(404).json({ message: "Prompt not found" });
  }

  return res.json({ prompt });
});

const createPrompt = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    category,
    targetAI,
    deliveryMode,
    promptContent,
    variables,
    sampleOutputs,
    tokenPrice,
    tags,
  } = req.body;

  if (!title || !description || !category || !targetAI || !deliveryMode || !promptContent || tokenPrice === undefined) {
    return res.status(400).json({ message: "Missing required prompt fields" });
  }

  const prompt = await Prompt.create({
    creatorId: req.user._id,
    title,
    description,
    category,
    targetAI,
    deliveryMode,
    promptContent,
    variables: variables || [],
    sampleOutputs: toArray(sampleOutputs),
    tokenPrice,
    tags: toArray(tags),
    status: "pending",
  });

  return res.status(201).json({ prompt });
});

const updatePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    return res.status(404).json({ message: "Prompt not found" });
  }

  if (!req.user.isAdmin && prompt.creatorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Cannot update this prompt" });
  }

  const allowed = [
    "title",
    "description",
    "category",
    "targetAI",
    "deliveryMode",
    "promptContent",
    "variables",
    "sampleOutputs",
    "tokenPrice",
    "tags",
  ];

  allowed.forEach((key) => {
    if (req.body[key] !== undefined) prompt[key] = ["sampleOutputs", "tags"].includes(key) ? toArray(req.body[key]) : req.body[key];
  });

  if (!req.user.isAdmin) {
    prompt.status = "pending";
  }

  await prompt.save();
  return res.json({ prompt });
});

const deletePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt) {
    return res.status(404).json({ message: "Prompt not found" });
  }

  if (!req.user.isAdmin && prompt.creatorId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Cannot delete this prompt" });
  }

  await prompt.deleteOne();
  return res.json({ message: "Prompt deleted" });
});

const purchasePrompt = asyncHandler(async (req, res) => {
  const prompt = await Prompt.findById(req.params.id);

  if (!prompt || prompt.status !== "approved") {
    return res.status(404).json({ message: "Prompt not available" });
  }

  if (prompt.creatorId.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: "Creators cannot buy their own prompt" });
  }

  const existing = await Purchase.findOne({ buyerId: req.user._id, promptId: prompt._id });
  if (existing) {
    return res.status(200).json({ purchase: existing, message: "Prompt already purchased" });
  }

  const buyer = await User.findOneAndUpdate(
    { _id: req.user._id, tokenBalance: { $gte: prompt.tokenPrice } },
    { $inc: { tokenBalance: -prompt.tokenPrice } },
    { new: true }
  );

  if (!buyer) {
    return res.status(402).json({ message: "Insufficient token balance" });
  }

  let purchase;

  try {
    purchase = await Purchase.create({
      buyerId: req.user._id,
      promptId: prompt._id,
      creatorId: prompt.creatorId,
      tokensPaid: prompt.tokenPrice,
    });
  } catch (error) {
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenBalance: prompt.tokenPrice } });

    if (error.code === 11000) {
      const duplicate = await Purchase.findOne({ buyerId: req.user._id, promptId: prompt._id });
      return res.status(200).json({ purchase: duplicate, message: "Prompt already purchased" });
    }

    throw error;
  }

  await Promise.all([
    User.findByIdAndUpdate(prompt.creatorId, {
      $inc: {
        totalEarnings: purchase.creatorEarnings,
        availableBalance: purchase.creatorEarnings,
      },
    }),
    Prompt.findByIdAndUpdate(prompt._id, {
      $inc: { totalSales: 1 },
      $addToSet: { uniqueBuyers: req.user._id },
    }),
    TokenTransaction.create({
      userId: req.user._id,
      type: "prompt_purchase",
      tokens: -prompt.tokenPrice,
      referenceId: `purchase:${purchase._id}`,
      metadata: { promptId: prompt._id, creatorId: prompt.creatorId },
    }),
  ]);

  return res.status(201).json({ purchase, buyer });
});

const getMyPrompts = asyncHandler(async (req, res) => {
  const prompts = await Prompt.find({ creatorId: req.user._id }).sort({ createdAt: -1 });
  return res.json({ prompts });
});

module.exports = {
  listPrompts,
  getPrompt,
  createPrompt,
  updatePrompt,
  deletePrompt,
  purchasePrompt,
  getMyPrompts,
};
