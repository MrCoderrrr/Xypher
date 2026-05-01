const express = require("express");
const User = require("../models/User");
const Prompt = require("../models/Prompt");
const Payout = require("../models/Payout");
const Purchase = require("../models/Purchase");
const Generation = require("../models/Generation");
const TokenTransaction = require("../models/TokenTransaction");
const { requireAuth, isAdmin } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, isAdmin);

router.get("/stats", async (req, res, next) => {
  try {
    const [users, creators, prompts, pendingPrompts, pendingPayouts, generations, earningsAgg] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "creator" }),
      Prompt.countDocuments(),
      Prompt.countDocuments({ status: "pending" }),
      Payout.countDocuments({ status: "pending" }),
      Generation.countDocuments(),
      Purchase.aggregate([
        {
          $group: {
            _id: null,
            platformEarnings: { $sum: { $ifNull: ["$platformEarnings", 0] } },
          },
        },
      ]),
    ]);
    res.json({
      stats: {
        users,
        creators,
        prompts,
        pendingPrompts,
        pendingPayouts,
        generations,
        platformEarnings: earningsAgg[0]?.platformEarnings || 0,
      },
    });
  } catch (e) { next(e); }
});
router.get("/", (req, res) => res.redirect("/api/admin/stats"));

router.get("/activity", async (req, res, next) => {
  try {
    const [payouts, prompts, purchases, transactions] = await Promise.all([
      Payout.find().populate("creator", "name").sort({ createdAt: -1 }).limit(5),
      Prompt.find().populate("creator", "name").sort({ createdAt: -1 }).limit(5),
      Purchase.find().populate("buyer", "name").populate("prompt", "title").sort({ createdAt: -1 }).limit(5),
      TokenTransaction.find({ type: "purchase" }).populate("user", "name").sort({ createdAt: -1 }).limit(5),
    ]);
    const rows = [
      ...payouts.map((item) => ({ id: `payout-${item._id}`, createdAt: item.createdAt, message: `${item.creator?.name || "Creator"} requested payout of ₹${Number(item.amount || 0).toLocaleString()}` })),
      ...prompts.map((item) => ({ id: `prompt-${item._id}`, createdAt: item.createdAt, message: `${item.creator?.name || "Creator"} submitted prompt "${item.title}" (${item.status})` })),
      ...purchases.map((item) => ({ id: `purchase-${item._id}`, createdAt: item.createdAt, message: `${item.buyer?.name || "Buyer"} purchased "${item.prompt?.title || "Prompt"}" for ${item.tokensSpent} tokens` })),
      ...transactions.map((item) => ({ id: `transaction-${item._id}`, createdAt: item.createdAt, message: `${item.user?.name || "User"} bought ${item.amount} tokens` })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, Number(req.query.limit || 12));
    res.json({ activity: rows });
  } catch (e) { next(e); }
});

router.get("/prompts", async (req, res, next) => {
  try { res.json({ prompts: await Prompt.find(req.query.status ? { status: req.query.status } : {}).populate("creator", "name email").sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.patch("/prompts/:id/review", async (req, res, next) => {
  try {
    const status = req.body.action === "approve" ? "approved" : "rejected";
    const prompt = await Prompt.findByIdAndUpdate(req.params.id, { status, adminNote: req.body.adminNote }, { new: true });
    res.json({ prompt });
  } catch (e) { next(e); }
});

router.get("/creators", async (req, res, next) => {
  try { res.json({ creators: await User.find({ role: { $in: ["creator", "admin"] } }).select("-password").sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.patch("/creators/:id/role", async (req, res, next) => {
  try {
    if (!["buyer", "creator", "admin"].includes(req.body.role)) return res.status(400).json({ message: "Invalid role" });
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role, isCreator: ["creator", "admin"].includes(req.body.role) }, { new: true });
    res.json({ user });
  } catch (e) { next(e); }
});

router.get("/payouts", async (req, res, next) => {
  try { res.json({ payouts: await Payout.find(req.query.status ? { status: req.query.status } : {}).populate("creator", "name email").sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

module.exports = router;
