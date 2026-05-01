const express = require("express");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const TokenTransaction = require("../models/TokenTransaction");
const PaymentAttempt = require("../models/PaymentAttempt");
const User = require("../models/User");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const packs = [
  { id: "starter", name: "Starter", tokens: 100, priceINR: 199, features: ["Unlock beginner prompts", "Run quick experiments"] },
  { id: "pro", name: "Pro", tokens: 500, priceINR: 799, popular: true, features: ["Buy premium prompts", "Run more generations"] },
  { id: "elite", name: "Elite", tokens: 1200, priceINR: 1799, features: ["Scale prompt workflows", "Best token value"] },
];

router.get("/packs", (req, res) => res.json({ packs }));
router.get("/token-packs", (req, res) => res.json({ packs }));

const canUseDevBypass = () =>
  process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_PAYMENT_BYPASS === "true";

const creditTokensForAttempt = async ({ userId, tokens, referenceId, description, paymentId, session }) => {
  const duplicate = await TokenTransaction.findOne({ referenceId }).session(session || null);
  if (duplicate) return { credited: false };
  await User.findByIdAndUpdate(userId, { $inc: { tokenBalance: tokens } }, { session });
  await TokenTransaction.create([{
    user: userId,
    type: "purchase",
    amount: tokens,
    referenceId,
    description,
  }], { session });
  await PaymentAttempt.findOneAndUpdate(
    { providerPaymentId: paymentId },
    { status: "credited", creditedAt: new Date() },
    { session }
  );
  return { credited: true };
};

router.post("/order", requireAuth, async (req, res, next) => {
  try {
    const pack = packs.find((p) => p.id === req.body.packId);
    if (!pack) return res.status(400).json({ message: "Invalid pack" });
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      if (!canUseDevBypass()) {
        return res.status(503).json({ message: "Payments unavailable: gateway keys missing" });
      }
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const referenceId = `dev:${Date.now()}:${req.user._id}:${pack.id}`;
        await PaymentAttempt.create([{
          user: req.user._id,
          packId: pack.id,
          packTokens: pack.tokens,
          amountInr: pack.priceINR,
          provider: "dev-bypass",
          providerPaymentId: referenceId,
          status: "dev-credited",
          creditedAt: new Date(),
        }], { session });
        await creditTokensForAttempt({
          userId: req.user._id,
          tokens: pack.tokens,
          referenceId,
          description: `${pack.name} token pack (dev bypass)`,
          paymentId: referenceId,
          session,
        });
        await session.commitTransaction();
        const user = await User.findById(req.user._id);
        return res.status(201).json({ devMode: true, user, pack });
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const order = await razorpay.orders.create({ amount: pack.priceINR * 100, currency: "INR", receipt: `xy_${Date.now()}`, notes: { packId: pack.id, userId: String(req.user._id) } });
    await PaymentAttempt.create({
      user: req.user._id,
      packId: pack.id,
      packTokens: pack.tokens,
      amountInr: pack.priceINR,
      provider: "razorpay",
      providerOrderId: order.id,
      status: "created",
    });
    res.status(201).json({ order, pack, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (e) { next(e); }
});

router.post("/verify", requireAuth, async (req, res, next) => {
  try {
    const { packId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const pack = packs.find((p) => p.id === packId);
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: "Payment verification unavailable" });
    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest("hex");
    if (!pack || expected !== razorpay_signature) return res.status(400).json({ message: "Invalid payment" });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await PaymentAttempt.findOneAndUpdate(
        { providerOrderId: razorpay_order_id },
        {
          $setOnInsert: {
            user: req.user._id,
            packId: pack.id,
            packTokens: pack.tokens,
            amountInr: pack.priceINR,
            provider: "razorpay",
            providerOrderId: razorpay_order_id,
          },
          $set: { providerPaymentId: razorpay_payment_id },
        },
        { upsert: true, new: true, session }
      );
      await creditTokensForAttempt({
        userId: req.user._id,
        tokens: pack.tokens,
        referenceId: `razorpay:${razorpay_payment_id}`,
        description: `${pack.name} token pack`,
        paymentId: razorpay_payment_id,
        session,
      });
      await session.commitTransaction();
      const user = await User.findById(req.user._id);
      res.json({ user });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (e) { next(e); }
});

router.post("/webhook", async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) return res.status(503).json({ message: "Webhook not configured" });
    const digest = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET).update(req.rawBody || Buffer.from("")).digest("hex");
    if (digest !== signature) return res.status(400).json({ message: "Invalid webhook signature" });
    const event = req.body?.event;
    const paymentEntity = req.body?.payload?.payment?.entity;
    if (!event || !paymentEntity) return res.status(200).json({ received: true });
    if (!["payment.captured", "order.paid"].includes(event)) return res.status(200).json({ received: true });

    const orderId = paymentEntity.order_id;
    const paymentId = paymentEntity.id;
    const attempt = await PaymentAttempt.findOne({ providerOrderId: orderId });
    if (!attempt) return res.status(200).json({ received: true });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await PaymentAttempt.findByIdAndUpdate(attempt._id, { providerPaymentId: paymentId }, { session });
      await creditTokensForAttempt({
        userId: attempt.user,
        tokens: attempt.packTokens,
        referenceId: `razorpay:${paymentId}`,
        description: `${attempt.packId} token pack`,
        paymentId,
        session,
      });
      await session.commitTransaction();
      res.status(200).json({ received: true });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (e) { next(e); }
});

module.exports = router;
