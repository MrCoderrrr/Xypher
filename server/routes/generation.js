const express = require("express");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const Generation = require("../models/Generation");
const TokenTransaction = require("../models/TokenTransaction");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/run", requireAuth, async (req, res, next) => {
  try {
    const prompt = await Prompt.findById(req.body.promptId);
    if (!prompt) return res.status(404).json({ message: "Prompt not found" });
    const owns = String(prompt.creator) === String(req.user._id) || await Purchase.findOne({ buyer: req.user._id, prompt: prompt._id });
    if (!owns) return res.status(403).json({ message: "Purchase required" });
    const cost = Math.ceil(prompt.price * 0.1);
    if (req.user.tokenBalance < cost) return res.status(402).json({ message: "Insufficient tokens" });
    const variables = req.body.variables || {};
    const output = prompt.promptContent.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key) => variables[key] || `[${key}]`);
    req.user.tokenBalance -= cost;
    await req.user.save();
    const generation = await Generation.create({ user: req.user._id, prompt: prompt._id, inputs: variables, output, tokensUsed: cost });
    await TokenTransaction.create({ user: req.user._id, type: "spend", amount: -cost, referenceId: `generation:${generation._id}`, description: `Generated ${prompt.title}` });
    res.status(201).json({ generation, output, user: req.user });
  } catch (e) { next(e); }
});

router.get("/history", requireAuth, async (req, res, next) => {
  try { res.json({ generations: await Generation.find({ user: req.user._id }).populate("prompt").sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

module.exports = router;
