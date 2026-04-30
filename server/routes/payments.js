const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const TokenTransaction = require("../models/TokenTransaction");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const packs = [
  { id: "starter", name: "Starter", tokens: 100, priceINR: 199, features: ["Unlock beginner prompts", "Run quick experiments"] },
  { id: "pro", name: "Pro", tokens: 500, priceINR: 799, popular: true, features: ["Buy premium prompts", "Run more generations"] },
  { id: "elite", name: "Elite", tokens: 1200, priceINR: 1799, features: ["Scale prompt workflows", "Best token value"] },
];

router.get("/packs", (req, res) => res.json({ packs }));
router.get("/token-packs", (req, res) => res.json({ packs }));

router.post("/order", requireAuth, async (req, res, next) => {
  try {
    const pack = packs.find((p) => p.id === req.body.packId);
    if (!pack) return res.status(400).json({ message: "Invalid pack" });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      req.user.tokenBalance += pack.tokens;
      await req.user.save();
      await TokenTransaction.create({ user: req.user._id, type: "purchase", amount: pack.tokens, referenceId: `dev:${Date.now()}:${req.user._id}`, description: `${pack.name} token pack` });
      return res.status(201).json({ devMode: true, user: req.user, pack });
    }
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({ amount: pack.priceINR * 100, currency: "INR", receipt: `xy_${Date.now()}`, notes: { packId: pack.id, userId: String(req.user._id) } });
    res.status(201).json({ order, pack, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) { next(e); }
});

router.post("/verify", requireAuth, async (req, res, next) => {
  try {
    const { packId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const pack = packs.find((p) => p.id === packId);
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (!pack || expected !== razorpay_signature) return res.status(400).json({ message: "Invalid payment" });
    req.user.tokenBalance += pack.tokens;
    await req.user.save();
    await TokenTransaction.create({ user: req.user._id, type: "purchase", amount: pack.tokens, referenceId: `razorpay:${razorpay_payment_id}`, description: `${pack.name} token pack` });
    res.json({ user: req.user });
  } catch (e) { next(e); }
});

module.exports = router;
