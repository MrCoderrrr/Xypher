const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
    tokensSpent: Number,
    creatorEarnings: Number,
    platformEarnings: Number,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

purchaseSchema.pre("validate", function split(next) {
  this.creatorEarnings = Math.round((this.tokensSpent || 0) * 75) / 100;
  this.platformEarnings = Math.round((this.tokensSpent || 0) * 25) / 100;
  next();
});
purchaseSchema.index({ buyer: 1, prompt: 1 }, { unique: true });

module.exports = mongoose.model("Purchase", purchaseSchema);
