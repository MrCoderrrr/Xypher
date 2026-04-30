export const promptView = (p = {}) => ({
  id: p._id || p.id,
  title: p.title,
  description: p.description,
  category: p.category,
  price: p.price,
  creatorName: p.creator?.name || p.creatorName,
  creatorAvatar: p.creator?.avatar || p.creatorAvatar,
  salesCount: p.salesCount || 0,
  rating: Number(p.rating || 0).toFixed(1),
  previewImage: p.previewImage || `https://picsum.photos/seed/${p._id || p.id}/400/225`,
  tags: p.tags || [],
  variables: p.variables || [],
  promptContent: p.promptContent,
  sampleOutput: p.sampleOutput,
  whatYouGet: p.whatYouGet || ["Reusable prompt system", "Structured variables", "Quality-tested output"],
  createdAt: p.createdAt,
  creator: p.creator,
  creatorId: p.creator?._id || p.creatorId,
  likes: p.likes?.length || p.likes || 0,
  status: p.status,
});

export const categories = ["Writing", "Coding", "Marketing", "Image", "Video", "Business", "Education", "SEO", "Social Media"];
