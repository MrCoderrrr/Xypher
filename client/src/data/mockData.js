export const creators = [
  { id: "maya-iyer", name: "Maya Iyer", email: "maya@xypher.ai", avatarInitials: "MI", avatarColor: "#6366F1", location: "Bengaluru, India", bio: "AI workflow designer helping teams turn scattered ideas into repeatable prompt systems.", longBio: "Maya builds practical prompt operating systems for founders, consultants, and operators who need repeatable output quality without endless prompt tweaking.", joinedDate: "Jan 2025", totalPrompts: 18, totalSales: 4820, avgRating: 4.9, followers: 12840, totalEarnings: 186400, skills: ["Strategy", "Operations", "Prompt Systems", "Education"], socialLinks: ["X", "LinkedIn", "Website"] },
  { id: "aarav-mehta", name: "Aarav Mehta", email: "aarav@xypher.ai", avatarInitials: "AM", avatarColor: "#06B6D4", location: "Mumbai, India", bio: "Product marketer building conversion prompts for SaaS, ecommerce, and launch teams.", longBio: "Aarav turns positioning research into crisp copy systems used by growth teams to ship campaigns faster.", joinedDate: "Mar 2025", totalPrompts: 14, totalSales: 3910, avgRating: 4.8, followers: 9200, totalEarnings: 142800, skills: ["SaaS", "Landing Pages", "SEO", "Growth"], socialLinks: ["X", "LinkedIn"] },
  { id: "nisha-rao", name: "Nisha Rao", email: "nisha@xypher.ai", avatarInitials: "NR", avatarColor: "#10B981", location: "Pune, India", bio: "Technical writer and educator crafting coding prompts for real developer workflows.", longBio: "Nisha specializes in debugging, code review, and teaching prompts that give engineers sharper feedback loops.", joinedDate: "May 2025", totalPrompts: 11, totalSales: 2760, avgRating: 4.7, followers: 7600, totalEarnings: 93800, skills: ["Coding", "Review", "Debugging", "Teaching"], socialLinks: ["GitHub", "LinkedIn"] },
  { id: "kabir-singh", name: "Kabir Singh", email: "kabir@xypher.ai", avatarInitials: "KS", avatarColor: "#F59E0B", location: "Delhi, India", bio: "Short-form video strategist with prompt packs for reels, hooks, and visual scripts.", longBio: "Kabir designs high-retention video prompt formats for creators and brands that need a repeatable content engine.", joinedDate: "Jun 2025", totalPrompts: 9, totalSales: 2150, avgRating: 4.6, followers: 6400, totalEarnings: 74120, skills: ["Video", "Hooks", "Social Media", "Storytelling"], socialLinks: ["X", "YouTube"] },
  { id: "zara-khan", name: "Zara Khan", email: "zara@xypher.ai", avatarInitials: "ZK", avatarColor: "#EF4444", location: "Hyderabad, India", bio: "Brand designer creating image-generation prompt systems for ecommerce studios.", longBio: "Zara blends art direction, lighting, and brand systems into prompts that produce consistent visual campaigns.", joinedDate: "Jul 2025", totalPrompts: 16, totalSales: 3540, avgRating: 4.8, followers: 8100, totalEarnings: 126900, skills: ["Image", "Brand", "Ecommerce", "Art Direction"], socialLinks: ["Instagram", "Website"] },
  { id: "dev-patel", name: "Dev Patel", email: "dev@xypher.ai", avatarInitials: "DP", avatarColor: "#8B5CF6", location: "Ahmedabad, India", bio: "Operations lead managing quality, creator reviews, and payout workflows.", longBio: "Dev helps marketplace teams maintain quality, speed, and creator trust through operational playbooks.", joinedDate: "Dec 2024", totalPrompts: 7, totalSales: 1320, avgRating: 4.7, followers: 3200, totalEarnings: 48900, skills: ["Admin", "Quality", "Ops", "Payments"], socialLinks: ["LinkedIn"] },
];

const byId = Object.fromEntries(creators.map((creator) => [creator.id, creator]));

export const prompts = [
  ["brand-shot-studio", "Brand Shot Studio", "Image", 120, "zara-khan", 1840, 4.9, ["product", "ecommerce", "ads"], "Create premium product scenes with clean lighting, realistic surfaces, and campaign-ready framing.", "Create a premium product photo of {{product}} for {{audience}} on {{surface}} with {{lighting}} lighting, commercial composition, crisp details, and brand-safe styling.", ["product", "audience", "surface", "lighting"]],
  ["saas-landing-copy", "SaaS Landing Copy System", "Marketing", 80, "aarav-mehta", 1420, 4.8, ["saas", "copy", "landing"], "Generate clear SaaS landing page messaging with positioning, proof, benefits, and CTAs.", "Write a high-converting landing page for {{product}} targeting {{customer}}. Use a {{tone}} tone. Include hero, proof, benefits, feature blocks, FAQ, and final CTA.", ["product", "customer", "tone"]],
  ["code-review-architect", "Senior Code Review Architect", "Coding", 95, "nisha-rao", 1210, 4.9, ["code", "review", "architecture"], "Review pull requests like a senior engineer with focus on bugs, risk, tests, and maintainability.", "Act as a senior engineer reviewing {{language}} code for {{system}}. Prioritize correctness, security, performance, missing tests, and maintainability.", ["language", "system"]],
  ["reel-hook-machine", "Reel Hook Machine", "Social Media", 70, "kabir-singh", 980, 4.7, ["reels", "hooks", "creator"], "Turn any topic into sharp short-video hooks, shot ideas, captions, and CTA variations.", "Create 12 short-form video hooks for {{topic}} aimed at {{audience}}. Include opening line, shot idea, caption, and CTA. Keep pacing {{pace}}.", ["topic", "audience", "pace"]],
  ["seo-brief-builder", "SEO Brief Builder", "SEO", 65, "aarav-mehta", 860, 4.6, ["seo", "content", "brief"], "Build search-focused content briefs with intent, outline, entities, and internal link guidance.", "Create an SEO content brief for keyword {{keyword}} targeting {{audience}} in {{market}}. Include intent, SERP angle, H2 outline, entities, FAQs, and internal links.", ["keyword", "audience", "market"]],
  ["business-plan-sprint", "Business Plan Sprint", "Business", 110, "maya-iyer", 770, 4.8, ["strategy", "startup", "planning"], "Transform rough startup ideas into a crisp business plan with risks, metrics, and launch steps.", "Create a practical business plan for {{idea}} serving {{customer}}. Include problem, solution, pricing, go-to-market, risks, validation tests, and 30-day plan.", ["idea", "customer"]],
  ["lesson-plan-lab", "Lesson Plan Lab", "Education", 55, "nisha-rao", 640, 4.7, ["education", "lesson", "teaching"], "Create classroom-ready lesson plans with objectives, activities, assessments, and differentiation.", "Design a {{duration}} lesson plan for {{grade}} students on {{topic}}. Include objectives, warm-up, activities, assessment, and materials.", ["duration", "grade", "topic"]],
  ["video-scene-director", "Video Scene Director", "Video", 130, "kabir-singh", 590, 4.8, ["video", "runway", "scene"], "Create cinematic video generation prompts with motion, camera direction, and scene continuity.", "Write a cinematic video prompt for {{scene}} in {{style}} style. Include camera movement, subject motion, lighting, environment, duration, and negatives.", ["scene", "style"]],
  ["email-sequence-pro", "Email Sequence Pro", "Writing", 75, "maya-iyer", 530, 4.6, ["email", "sales", "writing"], "Write cold, onboarding, or retention email sequences with clear psychology and concise CTAs.", "Write a {{sequence}} email sequence for {{offer}} targeting {{audience}}. Include subject lines, preview text, body, CTA, and personalization notes.", ["sequence", "offer", "audience"]],
  ["debugging-companion", "Debugging Companion", "Coding", 60, "nisha-rao", 470, 4.5, ["debugging", "devtools", "errors"], "Turn messy stack traces and vague symptoms into a focused debugging plan.", "Help debug this {{technology}} issue. Symptom: {{symptom}}. Error: {{error}}. Recent changes: {{recent_changes}}. Give likely causes and step checks.", ["technology", "symptom", "error", "recent_changes"]],
  ["linkedin-authority", "LinkedIn Authority Engine", "Social Media", 85, "aarav-mehta", 430, 4.7, ["linkedin", "personal-brand", "b2b"], "Create a week of founder-led LinkedIn posts that sound sharp, useful, and non-generic.", "Create 7 LinkedIn posts for {{persona}} about {{theme}}. Mix story, lesson, contrarian take, framework, and CTA. Voice should be {{voice}}.", ["persona", "theme", "voice"]],
  ["support-macro-genius", "Support Macro Genius", "Business", 50, "maya-iyer", 390, 4.5, ["support", "ops", "customer"], "Create empathetic, policy-safe customer support macros for common operations scenarios.", "Write support macros for {{scenario}} with tone {{tone}}. Include first response, follow-up, escalation note, and QA checklist.", ["scenario", "tone"]],
].map(([id, title, category, price, creatorId, salesCount, rating, tags, description, promptContent, vars], index) => ({
  id,
  title,
  description,
  category,
  tags,
  price,
  priceINR: price * 10,
  creatorId,
  rating,
  salesCount,
  likes: 120 + index * 37,
  promptContent,
  variables: vars.map((name) => ({ name, label: name.replaceAll("_", " "), placeholder: `Enter ${name.replaceAll("_", " ")}`, description: `Required input for ${name.replaceAll("_", " ")}.` })),
  sampleOutput: `Sample result from ${title}: precise, reusable, production-ready output shaped for ${category.toLowerCase()} workflows.`,
  previewImage: `https://picsum.photos/seed/${id}/400/225`,
  status: "approved",
  createdAt: `2026-04-${String(10 + index).padStart(2, "0")}`,
  creatorName: byId[creatorId].name,
  creatorAvatar: "",
  creatorInitials: byId[creatorId].avatarInitials,
  creatorColor: byId[creatorId].avatarColor,
  whatYouGet: ["Reusable prompt system", "Structured variables", "Quality-tested output pattern"],
}));

export const enrichedPrompts = prompts;
export const categories = ["Writing", "Coding", "Marketing", "Image", "Video", "Business", "Education", "SEO", "Social Media"];

export const tokenPacks = [
  { id: "starter", name: "Starter", tokens: 100, priceINR: 199, price: 199, popular: false, features: ["Unlock beginner prompts", "Run quick experiments", "Good for solo testing"] },
  { id: "pro", name: "Pro", tokens: 500, priceINR: 799, price: 799, popular: true, features: ["Buy premium prompts", "Run more generations", "Best for active builders"] },
  { id: "elite", name: "Elite", tokens: 1200, priceINR: 1799, price: 1799, popular: false, features: ["Scale prompt workflows", "Support team experiments", "Best value per token"] },
];

export const reviews = [
  ["r1", "brand-shot-studio", "zara-khan", "Rohan Shah", "RS", 5, "Our product shots finally looked consistent across campaigns. Prompt paid for itself in one afternoon.", "Apr 27"],
  ["r2", "saas-landing-copy", "aarav-mehta", "Anika Bose", "AB", 5, "The landing page structure was clean, specific, and far better than generic AI copy.", "Apr 25"],
  ["r3", "code-review-architect", "nisha-rao", "Sameer Nair", "SN", 5, "This became our pre-review checklist. It catches risky edge cases before PR review starts.", "Apr 23"],
  ["r4", "business-plan-sprint", "maya-iyer", "Isha Menon", "IM", 4, "Clear, practical, and not stuffed with MBA fluff. Loved the validation steps.", "Apr 20"],
  ["r5", "video-scene-director", "kabir-singh", "Neil Dsouza", "ND", 5, "Camera direction and negative prompts made video outputs much more controllable.", "Apr 18"],
  ["r6", "seo-brief-builder", "aarav-mehta", "Priya Sen", "PS", 4, "Great structure for briefs. It saves research time and gives writers strong direction.", "Apr 16"],
  ["r7", "lesson-plan-lab", "nisha-rao", "Leena Thomas", "LT", 5, "The lesson plans feel usable, not theoretical. Assessment ideas are especially helpful.", "Apr 14"],
  ["r8", "linkedin-authority", "aarav-mehta", "Vikram Rao", "VR", 4, "Helped me post consistently without sounding automated.", "Apr 12"],
].map(([id, promptId, creatorId, reviewerName, reviewerInitials, rating, text, date]) => ({
  id, promptId, creatorId, reviewerName, reviewerInitials, name: reviewerName, rating, text, quote: text, date, role: "Verified buyer", avatarColor: "#6366F1",
}));

export const testimonials = [
  { name: "Anika Bose", role: "Growth Lead", company: "Northstar CRM", text: "Xypher turned our prompt chaos into a repeatable growth workflow.", rating: 5, avatarInitials: "AB", avatarColor: "#06B6D4" },
  { name: "Sameer Nair", role: "Engineering Manager", company: "Stacklane", text: "Prompt quality feels curated, not random. Huge time saver for reviews.", rating: 5, avatarInitials: "SN", avatarColor: "#10B981" },
  { name: "Isha Menon", role: "Founder", company: "PilotDesk", text: "The creator prompts feel like buying expertise, not just text templates.", rating: 5, avatarInitials: "IM", avatarColor: "#6366F1" },
];

export const purchases = [
  { id: "p1", promptId: "brand-shot-studio", date: "Apr 28, 2026", tokens: 120 },
  { id: "p2", promptId: "saas-landing-copy", date: "Apr 24, 2026", tokens: 80 },
  { id: "p3", promptId: "code-review-architect", date: "Apr 21, 2026", tokens: 95 },
  { id: "p4", promptId: "business-plan-sprint", date: "Apr 18, 2026", tokens: 110 },
];

export const generations = [
  { id: "g1", promptId: "brand-shot-studio", date: "Today", tokens: 14, status: "completed", output: "Premium product photo of wireless headphones for students on graphite desk with soft studio lighting." },
  { id: "g2", promptId: "saas-landing-copy", date: "Yesterday", tokens: 9, status: "completed", output: "Hero copy for an AI meeting assistant targeting remote sales teams." },
  { id: "g3", promptId: "code-review-architect", date: "Apr 27", tokens: 11, status: "completed", output: "P1 finding around duplicate payment verification and missing idempotency key." },
  { id: "g4", promptId: "business-plan-sprint", date: "Apr 25", tokens: 12, status: "completed", output: "30-day validation sprint for AI tutor product." },
  { id: "g5", promptId: "email-sequence-pro", date: "Apr 20", tokens: 8, status: "completed", output: "Five-email onboarding sequence for analytics dashboard." },
  { id: "g6", promptId: "video-scene-director", date: "Apr 19", tokens: 16, status: "failed", output: "Provider timeout before final render." },
];

export const payouts = [
  { id: "po1", creatorId: "maya-iyer", amount: 18450, method: "UPI", status: "pending", date: "Apr 29, 2026", adminNote: "Awaiting finance review" },
  { id: "po2", creatorId: "aarav-mehta", amount: 12200, method: "Bank", status: "processed", date: "Apr 25, 2026", adminNote: "Processed via NEFT" },
  { id: "po3", creatorId: "nisha-rao", amount: 7600, method: "UPI", status: "failed", date: "Apr 20, 2026", adminNote: "UPI ID mismatch" },
  { id: "po4", creatorId: "kabir-singh", amount: 5900, method: "Bank", status: "pending", date: "Apr 18, 2026", adminNote: "Verification pending" },
  { id: "po5", creatorId: "zara-khan", amount: 21100, method: "Bank", status: "processed", date: "Apr 14, 2026", adminNote: "Paid" },
];

export const currentUser = { name: "Suresh", tokenBalance: 1480, promptsOwned: purchases.length, generationsRun: generations.length };
export const platformStats = { prompts: 2400, creators: 840, generations: 18000, users: 12840, pendingPrompts: 18, pendingPayouts: 7, platformEarnings: 382000 };
export const earningsBars = [1200, 1800, 900, 2400, 3200, 2700, 4100];
export const tokenTransactions = [];
