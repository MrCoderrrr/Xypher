const mongoose = require("mongoose");

const generationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: mongoose.Schema.Types.ObjectId, ref: "Prompt", required: true },
    inputs: { type: Object, default: {} },
    output: String,
    tokensUsed: Number,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Generation", generationSchema);
