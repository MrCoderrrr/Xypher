import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Share2, Star } from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import PromptCard from "../components/PromptCard";
import PromptCardSkeleton from "../components/PromptCardSkeleton";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { fadeUp, scaleIn, staggerContainer } from "../utils/animations";

function hueFromId(id) {
  return [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) * 30;
}

function CreatorProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("Prompts");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["creator", id],
    queryFn: async () => {
      const { data } = await api.get(`/users/profile/${id}`);
      return data;
    }
  });
  const { data: followData, refetch: refetchFollow } = useQuery({
    queryKey: ["follow", id],
    queryFn: async () => {
      if (!user) return { following: false, followers: profileData?.user?.followers?.length || 0 };
      const { data } = await api.get(`/users/profile/${id}`).catch(() => ({ data: { user: { followers: [] } } }));
      const isFollowing = data.user?.followers?.some(f => String(f._id || f) === String(user.id));
      return { following: isFollowing, followers: data.user?.followers?.length || 0 };
    },
    enabled: !!profileData
  });
  const { data: reviewsData } = useQuery({
    queryKey: ["creator-reviews", id, profileData?.prompts?.length],
    enabled: !!profileData?.prompts?.length,
    queryFn: async () => {
      const topPromptIds = profileData.prompts.slice(0, 5).map((p) => p._id || p.id);
      const reviewResponses = await Promise.all(
        topPromptIds.map(async (promptId) => {
          const { data } = await api.get(`/prompts/${promptId}/reviews`);
          return data.reviews || [];
        })
      );
      return reviewResponses.flat().slice(0, 20);
    },
  });
  const followMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/users/follow/${id}`);
      return data;
    },
    onSuccess: () => {
      refetchFollow();
      toast.success(followData?.following ? "Unsubscribed" : "Subscribed!");
    },
    onError: () => toast.error("Please login to subscribe")
  });
  const creator = profileData?.user || {};
  const prompts = useMemo(() => {
    let list = (profileData?.prompts || []).filter((prompt) => prompt.title?.toLowerCase().includes(query.toLowerCase()));
    if (sort === "popular") list = [...list].sort((a, b) => b.salesCount - a.salesCount);
    if (sort === "price") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "newest") list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [profileData, query, sort]);
  const creatorReviews = reviewsData || [];
  const bannerHue = hueFromId(id || "creator");

  return (
    <section>
      <div className="h-[200px]" style={{ background: `linear-gradient(135deg, hsl(${bannerHue}, 70%, 20%), rgba(6,182,212,0.16))` }} />
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="-mt-12">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex rounded-full border-4 border-bg-primary"><Avatar initials={creator.avatarInitials} color={creator.avatarColor} name={creator.name} size="lg" /></div>
              <h1 className="mt-4 font-heading text-4xl font-black">{creator.name}</h1>
              <p className="mt-2 max-w-2xl text-lg text-text-muted">{creator.bio}</p>
              <p className="mt-2 text-base text-text-muted">Joined {creator.joinedDate} • {creator.location}</p>
            </div>
            <div className="flex gap-3">
              <div className="relative">
                <Button className={followData?.following ? "confetti" : ""} onClick={() => followMutation.mutate()} loading={followMutation.isPending}>{followData?.following ? "Subscribed ✓" : "Subscribe"}</Button>
              </div>
              <Button variant="secondary" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }}><Share2 size={16} /> Share Profile</Button>
            </div>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            {[["Prompts", creator.totalPrompts || 0], ["Total Sales", creator.totalSales || 0], ["Avg Rating", `${creator.avgRating?.toFixed?.(1) || "4.5"}★`], ["Followers", (followData?.followers || creator.followers?.length || 0).toLocaleString()]].map(([label, value]) => <div key={label} className="rounded-xl border border-border bg-bg-card p-4"><p className="font-heading text-3xl font-black">{value}</p><p className="text-base text-text-muted">{label}</p></div>)}
          </div>
        </motion.div>

        <div className="mt-10 border-b border-border">
          <div className="flex gap-6">
            {["Prompts", "Reviews", "About"].map((item) => <button key={item} onClick={() => setTab(item)} className="relative px-1 py-4 text-base font-bold text-text-muted hover:text-text-primary">{item}{tab === item && <motion.span layoutId="creator-tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-indigo-500" />}</button>)}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }} className="py-10">
            {tab === "Prompts" && (
              <>
                <div className="mb-6 flex flex-col gap-3 sm:flex-row">
                  <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-bg-card px-4 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"><Search size={16} className="text-text-muted" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search creator prompts" className="w-full bg-transparent py-3 outline-none placeholder:text-slate-600" /></div>
                  <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-border bg-bg-card px-4 py-3 outline-none focus:border-indigo-500"><option value="newest">Newest</option><option value="popular">Most Popular</option><option value="price">Price</option></select>
                </div>
                {profileLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <PromptCardSkeleton key={i} />)}</div>
                ) : (
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{prompts.map((prompt) => <motion.div key={prompt._id || prompt.id} variants={scaleIn}><PromptCard {...prompt} id={prompt._id || prompt.id} showLike /></motion.div>)}</motion.div>
                )}
              </>
            )}
            {tab === "Reviews" && (
              <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div className="rounded-xl border border-border bg-bg-card p-6"><p className="font-heading text-5xl font-bold">{creator.avgRating}</p><div className="mt-2 flex text-amber-300">{Array.from({ length: 5 }).map((_, i) => <Star key={i} fill="currentColor" />)}</div>{[60, 25, 10, 4, 1].map((w, i) => <div key={i} className="mt-4 flex items-center gap-3 text-sm text-text-muted"><span>{5 - i}★</span><div className="h-2 flex-1 rounded-full bg-bg-elevated"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${w}%` }} /></div></div>)}</div>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4">{creatorReviews.map((review) => <motion.div variants={fadeUp} key={review._id} className="rounded-xl border border-border bg-bg-card p-5"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} /><div><p className="font-semibold">{review.reviewer?.name || "Anonymous"}</p><p className="text-xs text-text-muted">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "-"}</p></div></div><div className="flex text-amber-300">{Array.from({ length: review.rating || 0 }).map((_, i) => <Star key={i} size={15} fill="currentColor" />)}</div></div><p className="mt-3 text-text-muted">"{review.text}"</p></motion.div>)}</motion.div>
              </div>
            )}
            {tab === "About" && (
              <div className="rounded-xl border border-border bg-bg-card p-6"><p className="max-w-3xl leading-8 text-text-muted">{creator.bio || creator.longBio || "No bio available."}</p><div className="mt-6 flex flex-wrap gap-2">{(creator.skills || []).map((skill) => <span key={skill} className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">{skill}</span>)}</div><p className="mt-6 text-sm text-text-muted">Member since {creator.createdAt ? new Date(creator.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Recently"}</p><div className="mt-4 flex gap-3">{(creator.socialLinks || []).map((link) => <Button key={link} variant="secondary" size="sm">{link}</Button>)}</div></div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default CreatorProfile;
