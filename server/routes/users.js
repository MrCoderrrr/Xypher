const express = require("express");
const User = require("../models/User");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const Generation = require("../models/Generation");
const TokenTransaction = require("../models/TokenTransaction");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/creators", async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 12, sort = "top", minRating = 0, minSales = 0 } = req.query;
    const filter = {
      role: { $in: ["creator", "admin"] },
      ...(search
        ? {
            $or: [
              { name: new RegExp(search, "i") },
              { bio: new RegExp(search, "i") },
              { skills: new RegExp(search, "i") },
            ],
          }
        : {}),
    };

    const creators = await User.find(filter)
      .select("name avatar bio skills followers totalEarnings createdAt role")
      .sort({ totalEarnings: -1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const creatorIds = creators.map((c) => c._id);
    const promptStats = await Prompt.aggregate([
      { $match: { creator: { $in: creatorIds }, status: "approved" } },
      {
        $group: {
          _id: "$creator",
          totalPrompts: { $sum: 1 },
          totalSales: { $sum: { $ifNull: ["$salesCount", 0] } },
          avgRating: { $avg: { $ifNull: ["$rating", 0] } },
        },
      },
    ]);
    const statsMap = new Map(promptStats.map((s) => [String(s._id), s]));

    const total = await User.countDocuments(filter);
    let normalized = creators.map((creator) => {
      const stats = statsMap.get(String(creator._id)) || {};
      return {
        ...creator.toObject(),
        totalPrompts: stats.totalPrompts || 0,
        totalSales: stats.totalSales || 0,
        avgRating: Number(stats.avgRating || 0),
      };
    });

    normalized = normalized.filter(
      (creator) => Number(creator.avgRating || 0) >= Number(minRating) && Number(creator.totalSales || 0) >= Number(minSales)
    );
    normalized.sort((a, b) => {
      if (sort === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === "rating") return Number(b.avgRating || 0) - Number(a.avgRating || 0);
      if (sort === "sales") return Number(b.totalSales || 0) - Number(a.totalSales || 0);
      return Number(b.totalEarnings || 0) - Number(a.totalEarnings || 0);
    });

    res.json({ creators: normalized, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { next(e); }
});

router.get("/profile/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    const prompts = await Prompt.find({ creator: user._id, status: "approved" }).populate("creator", "name avatar").sort({ createdAt: -1 });
    res.json({ user, prompts });
  } catch (e) { next(e); }
});

router.patch("/profile", requireAuth, async (req, res, next) => {
  try {
    ["name", "avatar", "bio", "skills", "socialLinks"].forEach((key) => { if (req.body[key] !== undefined) req.user[key] = req.body[key]; });
    await req.user.save();
    res.json({ user: req.user });
  } catch (e) { next(e); }
});

router.get("/library", requireAuth, async (req, res, next) => {
  try {
    const purchases = await Purchase.find({ buyer: req.user._id }).populate({ path: "prompt", populate: { path: "creator", select: "name avatar" } }).sort({ createdAt: -1 });
    res.json({ prompts: purchases.map((p) => p.prompt), purchases });
  } catch (e) { next(e); }
});

router.get("/dashboard", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [purchases, generations, transactions, prompts, purchaseStats, promptStats] = await Promise.all([
      Purchase.find({ buyer: req.user._id }).populate("prompt").sort({ createdAt: -1 }).limit(10),
      Generation.find({ user: req.user._id }).populate("prompt").sort({ createdAt: -1 }).limit(10),
      TokenTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20),
      Prompt.find({ creator: req.user._id }).sort({ createdAt: -1 }),
      Purchase.aggregate([
        { $match: { buyer: userId } },
        {
          $group: {
            _id: null,
            promptsOwned: { $sum: 1 },
            tokensSpent: { $sum: { $ifNull: ["$tokensSpent", 0] } },
          },
        },
      ]),
      Prompt.aggregate([
        { $match: { creator: userId } },
        {
          $group: {
            _id: null,
            totalSales: { $sum: { $ifNull: ["$salesCount", 0] } },
            livePrompts: {
              $sum: {
                $cond: [{ $eq: ["$status", "approved"] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);
    const pStats = purchaseStats[0] || { promptsOwned: 0, tokensSpent: 0 };
    const prStats = promptStats[0] || { livePrompts: 0, totalSales: 0 };

    res.json({
      user: req.user,
      purchases,
      generations,
      transactions,
      prompts,
      stats: {
        promptsOwned: pStats.promptsOwned,
        generationsRun: generations.length,
        tokensSpent: pStats.tokensSpent,
        livePrompts: prStats.livePrompts,
        totalSales: prStats.totalSales,
      },
    });
  } catch (e) { next(e); }
});

router.get("/transactions", requireAuth, async (req, res, next) => {
  try { res.json({ transactions: await TokenTransaction.find({ user: req.user._id }).sort({ createdAt: -1 }) }); } catch (e) { next(e); }
});

router.post("/follow/:id", requireAuth, async (req, res, next) => {
  try {
    const target = await User.findById(req.params.id);
    const has = target.followers.some((id) => String(id) === String(req.user._id));
    target.followers = has ? target.followers.filter((id) => String(id) !== String(req.user._id)) : [...target.followers, req.user._id];
    await target.save();
    res.json({ following: !has, followers: target.followers.length });
  } catch (e) { next(e); }
});

module.exports = router;
