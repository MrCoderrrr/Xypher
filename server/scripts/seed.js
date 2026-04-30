const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");
const Prompt = require("../models/Prompt");

dotenv.config();

const seed = async () => {
  await connectDB();

  const creator = await User.findOneAndUpdate(
    { clerkId: "dev-creator" },
    {
      $set: {
        username: "Aarav Mehta",
        email: "creator@promptmarket.local",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
        isCreator: true,
        isAdmin: false,
        creatorTier: "elite",
      },
      $setOnInsert: {
        tokenBalance: 1000,
        totalEarnings: 0,
        availableBalance: 0,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  await User.findOneAndUpdate(
    { clerkId: "dev-user" },
    {
      $set: {
        username: "Dev User",
        email: "dev@promptmarket.local",
        isCreator: true,
        isAdmin: true,
        creatorTier: "elite",
      },
      $setOnInsert: {
        tokenBalance: 10000,
        totalEarnings: 0,
        availableBalance: 0,
      },
    },
    { new: true, upsert: true, runValidators: true }
  );

  const prompts = [
    {
      title: "Brand Shot Studio",
      description: "Create polished product visuals with clean lighting and channel-ready framing.",
      category: "image",
      targetAI: "Fal SDXL",
      deliveryMode: "live",
      promptContent:
        "Premium product photo of {{product}} for {{audience}}, on {{surface}}, lit with soft studio light, sharp detail.",
      variables: [
        { name: "product", label: "Product", placeholder: "ceramic coffee mug" },
        { name: "audience", label: "Audience", placeholder: "premium shoppers" },
        { name: "surface", label: "Surface", placeholder: "matte stone table" },
      ],
      sampleOutputs: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"],
      tokenPrice: 120,
      tags: ["product", "ecommerce", "ads"],
      status: "approved",
    },
    {
      title: "SaaS Landing Copy",
      description: "Generate concise landing page copy for B2B products with clear positioning.",
      category: "text",
      targetAI: "GPT",
      deliveryMode: "text",
      promptContent:
        "Write a high-converting landing page for {{product}} targeting {{customer}}. Tone: {{tone}}.",
      variables: [
        { name: "product", label: "Product", placeholder: "AI support desk" },
        { name: "customer", label: "Customer", placeholder: "SaaS founders" },
        { name: "tone", label: "Tone", placeholder: "clear and confident" },
      ],
      sampleOutputs: ["https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=900&q=80"],
      tokenPrice: 65,
      tags: ["saas", "copy", "conversion"],
      status: "approved",
    },
    {
      title: "Reel Hook Machine",
      description: "Turn topics into punchy short-video concepts, hooks, captions, and shot lists.",
      category: "video",
      targetAI: "Runway",
      deliveryMode: "text",
      promptContent:
        "Create 10 short-form video hooks for {{topic}} aimed at {{audience}}. Add shot idea, caption, and CTA.",
      variables: [
        { name: "topic", label: "Topic", placeholder: "AI productivity" },
        { name: "audience", label: "Audience", placeholder: "solo founders" },
      ],
      sampleOutputs: ["https://images.unsplash.com/photo-1611162618071-b39a2ec055fb?auto=format&fit=crop&w=900&q=80"],
      tokenPrice: 90,
      tags: ["shorts", "hooks", "creator"],
      status: "approved",
    },
  ];

  for (const prompt of prompts) {
    await Prompt.findOneAndUpdate(
      { title: prompt.title, creatorId: creator._id },
      { $set: { ...prompt, creatorId: creator._id } },
      { new: true, upsert: true, runValidators: true }
    );
  }

  console.log("Seed complete");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
