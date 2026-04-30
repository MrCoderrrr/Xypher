const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

reviewSchema.index({ reviewer: 1, prompt: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
