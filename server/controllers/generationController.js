const Generation = require("../models/Generation");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const User = require("../models/User");
const TokenTransaction = require("../models/TokenTransaction");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const interpolatePrompt = (template, variables = {}) =>
  template.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => {
    const value = variables[key];
    return value === undefined || value === null || value === "" ? `[${key}]` : String(value);
  });

const canUsePrompt = async (user, prompt) => {
  if (prompt.creatorId.toString() === user._id.toString()) return true;
  const purchase = await Purchase.findOne({ buyerId: user._id, promptId: prompt._id });
  return Boolean(purchase);
};

const runGeneration = asyncHandler(async (req, res) => {
  const { promptId, inputVariables, tokensUsed } = req.body;

  const prompt = await Prompt.findById(promptId);
  if (!prompt || prompt.status !== "approved") {
    return res.status(404).json({ message: "Prompt not available" });
  }

  const allowed = await canUsePrompt(req.user, prompt);
  if (!allowed) {
    return res.status(403).json({ message: "Purchase prompt before generation" });
  }

  const cost = Math.max(1, Number(tokensUsed) || Math.ceil(prompt.tokenPrice * 0.1));
  const user = await User.findOneAndUpdate(
    { _id: req.user._id, tokenBalance: { $gte: cost } },
    { $inc: { tokenBalance: -cost } },
    { new: true }
  );

  if (!user) {
    return res.status(402).json({ message: "Insufficient token balance" });
  }

  const output = interpolatePrompt(prompt.promptContent, inputVariables);

  const generation = await Generation.create({
    userId: req.user._id,
    promptId: prompt._id,
    inputVariables: inputVariables || {},
    aiUsed: prompt.targetAI,
    tokensUsed: cost,
    status: "completed",
    output,
  });

  await TokenTransaction.create({
    userId: req.user._id,
    type: "generation",
    tokens: -cost,
    referenceId: `generation:${generation._id}`,
    metadata: { promptId: prompt._id, targetAI: prompt.targetAI },
  });

  return res.status(201).json({ generation, user });
});

const listMyGenerations = asyncHandler(async (req, res) => {
  const generations = await Generation.find({ userId: req.user._id })
    .populate("promptId", "title category targetAI")
    .sort({ createdAt: -1 });

  return res.json({ generations });
});

const getGeneration = asyncHandler(async (req, res) => {
  const generation = await Generation.findById(req.params.id).populate("promptId", "title category targetAI");

  if (!generation) {
    return res.status(404).json({ message: "Generation not found" });
  }

  if (!req.user.isAdmin && generation.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Cannot view this generation" });
  }

  return res.json({ generation });
});

module.exports = {
  runGeneration,
  listMyGenerations,
  getGeneration,
};
