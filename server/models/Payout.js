const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: Number,
    method: { type: String, enum: ["UPI", "Bank"], required: true },
    paymentDetails: String,
    status: { type: String, enum: ["pending", "processed", "failed"], default: "pending" },
    adminNote: String,
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

module.exports = mongoose.model("Payout", payoutSchema);
