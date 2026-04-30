const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("../models/User");
const Payout = require("../models/Payout");
const TokenTransaction = require("../models/TokenTransaction");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const tokenPacks = {
  starter: { name: "Starter", tokens: 500, amount: 499 },
  growth: { name: "Growth", tokens: 1500, amount: 1299 },
  studio: { name: "Studio", tokens: 5000, amount: 3999 },
};

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

const listTokenPacks = asyncHandler(async (req, res) => {
  return res.json({ packs: tokenPacks });
});

const createTokenOrder = asyncHandler(async (req, res) => {
  const pack = tokenPacks[req.body.packId];

  if (!pack) {
    return res.status(400).json({ message: "Invalid token pack" });
  }

  const receipt = `tok_${Date.now()}_${req.user._id.toString().slice(-6)}`;
  const razorpay = getRazorpay();

  if (!razorpay) {
    return res.status(201).json({
      order: {
        id: `dev_${receipt}`,
        amount: pack.amount * 100,
        currency: "INR",
        receipt,
        notes: { packId: req.body.packId, userId: req.user._id.toString() },
      },
      pack,
      mode: "dev",
    });
  }

  const order = await razorpay.orders.create({
    amount: pack.amount * 100,
    currency: "INR",
    receipt,
    notes: {
      packId: req.body.packId,
      userId: req.user._id.toString(),
    },
  });

  return res.status(201).json({ order, pack, keyId: process.env.RAZORPAY_KEY_ID });
});

const verifyTokenPayment = asyncHandler(async (req, res) => {
  const { packId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const pack = tokenPacks[packId];

  if (!pack || !razorpay_order_id || !razorpay_payment_id) {
    return res.status(400).json({ message: "Missing payment verification fields" });
  }

  const isDevOrder = String(razorpay_order_id).startsWith("dev_");

  if (!isDevOrder) {
    if (!razorpay_signature) {
      return res.status(400).json({ message: "Payment signature required" });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }
  }

  const referenceId = `razorpay:${razorpay_payment_id}`;
  const existing = await TokenTransaction.findOne({ referenceId });

  if (existing) {
    const user = await User.findById(req.user._id);
    return res.json({ user, transaction: existing, message: "Payment already credited" });
  }

  let transaction;

  try {
    transaction = await TokenTransaction.create({
      userId: req.user._id,
      type: "token_purchase",
      tokens: pack.tokens,
      amount: pack.amount,
      referenceId,
      metadata: { packId, razorpay_order_id, razorpay_payment_id },
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicate = await TokenTransaction.findOne({ referenceId });
      const user = await User.findById(req.user._id);
      return res.json({ user, transaction: duplicate, message: "Payment already credited" });
    }

    throw error;
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { tokenBalance: pack.tokens } },
    { new: true, runValidators: true }
  );

  return res.json({ user, transaction });
});

const requestPayout = asyncHandler(async (req, res) => {
  const { amount, method, paymentDetails } = req.body;

  if (!amount || amount <= 0 || !["upi", "bank"].includes(method)) {
    return res.status(400).json({ message: "Valid amount and method are required" });
  }

  if (!req.user.isCreator) {
    return res.status(403).json({ message: "Creator access required" });
  }

  const creator = await User.findOneAndUpdate(
    { _id: req.user._id, availableBalance: { $gte: amount } },
    { $inc: { availableBalance: -amount } },
    { new: true }
  );

  if (!creator) {
    return res.status(400).json({ message: "Insufficient available balance" });
  }

  let payout;

  try {
    payout = await Payout.create({
      creatorId: req.user._id,
      amount,
      method,
      paymentDetails: paymentDetails || {},
    });
  } catch (error) {
    await User.findByIdAndUpdate(req.user._id, { $inc: { availableBalance: amount } });
    throw error;
  }

  await TokenTransaction.create({
    userId: req.user._id,
    type: "payout",
    tokens: 0,
    amount,
    referenceId: `payout:${payout._id}`,
  });

  return res.status(201).json({ payout, creator });
});

const listMyPayouts = asyncHandler(async (req, res) => {
  const payouts = await Payout.find({ creatorId: req.user._id }).sort({ requestedAt: -1 });
  return res.json({ payouts });
});

const listMyTransactions = asyncHandler(async (req, res) => {
  const transactions = await TokenTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  return res.json({ transactions });
});

module.exports = {
  listTokenPacks,
  createTokenOrder,
  verifyTokenPayment,
  requestPayout,
  listMyPayouts,
  listMyTransactions,
};
