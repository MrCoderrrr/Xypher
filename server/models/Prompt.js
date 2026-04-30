const mongoose = require("mongoose");

const promptSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    promptContent: { type: String, required: true },
    category: { type: String, enum: ["Writing", "Coding", "Marketing", "Image", "Video", "Business", "Education", "SEO", "Social Media"], required: true },
    tags: [String],
    variables: [{ name: String, description: String }],
    sampleOutput: String,
    previewImage: String,
    price: { type: Number, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerName: { type: String, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminNote: String,
    salesCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

promptSchema.index({ status: 1, category: 1, createdAt: -1 });
promptSchema.index({ title: "text", description: "text", tags: "text" });

module.exports = mongoose.model("Prompt", promptSchema);
