const mongoose = require("mongoose");

const tokenTransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["purchase", "spend", "earn", "payout"], required: true },
    amount: Number,
    referenceId: { type: String, unique: true, sparse: true },
    description: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("TokenTransaction", tokenTransactionSchema);
