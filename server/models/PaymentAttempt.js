const mongoose = require("mongoose");

const paymentAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    packId: { type: String, required: true },
    packTokens: { type: Number, required: true },
    amountInr: { type: Number, required: true },
    provider: { type: String, enum: ["razorpay", "dev-bypass"], default: "razorpay" },
    providerOrderId: { type: String, unique: true, sparse: true },
    providerPaymentId: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["created", "credited", "failed", "dev-credited"],
      default: "created",
    },
    creditedAt: Date,
    meta: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

paymentAttemptSchema.pre("save", function updateTimestamp(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("PaymentAttempt", paymentAttemptSchema);
