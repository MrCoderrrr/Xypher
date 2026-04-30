const User = require("../models/User");
const Prompt = require("../models/Prompt");
const Purchase = require("../models/Purchase");
const Generation = require("../models/Generation");
const TokenTransaction = require("../models/TokenTransaction");
const { getRequestClerkId } = require("../middleware/auth");

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const syncUser = asyncHandler(async (req, res) => {
  const clerkId = getRequestClerkId(req);
  const { username, email, avatar } = req.body;

  if (!clerkId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  if (!clerkId || !username || !email) {
    return res.status(400).json({ message: "username and email are required" });
  }

  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        username,
        email,
        avatar,
        lastLoginAt: new Date(),
      },
      $setOnInsert: {
        tokenBalance: 0,
        isCreator: false,
        isAdmin: false,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  return res.status(200).json({ user });
});

const getMe = asyncHandler(async (req, res) => {
  const [purchases, generations, transactions] = await Promise.all([
    Purchase.find({ buyerId: req.user._id }).populate("promptId").sort({ createdAt: -1 }),
    Generation.find({ userId: req.user._id }).populate("promptId").sort({ createdAt: -1 }).limit(20),
    TokenTransaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50),
  ]);

  return res.json({ user: req.user, purchases, generations, transactions });
});

const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["username", "avatar"];
  const updates = {};

  allowed.forEach((key) => {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  return res.json({ user });
});

const becomeCreator = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, { isCreator: true }, { new: true, runValidators: true });
  return res.json({ user });
});

const listCreators = asyncHandler(async (req, res) => {
  const creators = await User.find({ isCreator: true })
    .select("-email -clerkId")
    .sort({ totalEarnings: -1, createdAt: -1 });

  return res.json({ creators });
});

const getCreatorProfile = asyncHandler(async (req, res) => {
  const creator = await User.findById(req.params.id).select("-email -clerkId");

  if (!creator || !creator.isCreator) {
    return res.status(404).json({ message: "Creator not found" });
  }

  const prompts = await Prompt.find({ creatorId: creator._id, status: "approved" }).sort({ createdAt: -1 });
  return res.json({ creator, prompts });
});

module.exports = {
  syncUser,
  getMe,
  updateMe,
  becomeCreator,
  listCreators,
  getCreatorProfile,
};
