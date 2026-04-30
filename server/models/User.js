const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkId: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, trim: true },
    avatar: String,
    role: { type: String, enum: ["buyer", "creator", "admin"], default: "buyer" },
    isCreator: { type: Boolean, default: false },
    tokenBalance: { type: Number, default: 0 },
    bio: String,
    skills: [String],
    socialLinks: { twitter: String, github: String },
    totalEarnings: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedPrompts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prompt" }],
    likedPrompts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Prompt" }],
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("User", userSchema);
