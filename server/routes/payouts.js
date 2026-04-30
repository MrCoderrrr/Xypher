const express = require("express");
const Payout = require("../models/Payout");
const TokenTransaction = require("../models/TokenTransaction");
const { requireAuth, isCreator, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/request", requireAuth, isCreator, async (req, res, next) => {
  try {
    const { amount, method, paymentDetails } = req.body;
    if (!amount || amount > req.user.availableBalance) return res.status(400).json({ message: "Invalid amount" });
    req.user.availableBalance -= amount;
    await req.user.save();
    const payout = await Payout.create({ creator: req.user._id, amount, method, paymentDetails });
    await TokenTransaction.create({ user: req.user._id, type: "payout", amount: -amount, referenceId: `payout:${payout._id}`, description: "Payout requested" });
    res.status(201).json({ payout, user: req.user });
  } catch (e) { next(e); }
});

router.get("/my", requireAuth, isCreator, async (req, res, next) => {
  try { res.json({ payouts: await Payout.find({ creator: req.user._id }).sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.get("/", requireAuth, isAdmin, async (req, res, next) => {
  try { res.json({ payouts: await Payout.find(req.query.status ? { status: req.query.status } : {}).populate("creator", "name email").sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.patch("/:id/process", requireAuth, isAdmin, async (req, res, next) => {
  try {
    const status = req.body.action || req.body.status;
    const payout = await Payout.findByIdAndUpdate(req.params.id, { status, adminNote: req.body.adminNote }, { new: true });
    res.json({ payout });
  } catch (e) { next(e); }
});

module.exports = router;
