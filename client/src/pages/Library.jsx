import { useMemo, useState } from "react";
import { Library as LibraryIcon, Search, Bookmark, Heart, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import EmptyState from "../components/EmptyState";
import PromptCard from "../components/PromptCard";
import PromptCardSkeleton from "../components/PromptCardSkeleton";
import api from "../utils/axios";
import { fadeUp, scaleIn, staggerContainer } from "../utils/animations";

function Library() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("Used");
  
  const { data, isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      const { data } = await api.get("/users/library");
      return data;
    }
  });

  const activePrompts = useMemo(() => {
    let source = [];
    if (tab === "Used") source = data?.usedPrompts || data?.prompts || []; // fallback for mock/old structure
    else if (tab === "Saved") source = data?.savedPrompts || [];
    else if (tab === "Liked") source = data?.likedPrompts || [];

    return source.filter((prompt) => (prompt?.title || "").toLowerCase().includes(query.toLowerCase()));
  }, [data, query, tab]);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-black">My Library</h1>
      
      <div className="mt-8 border-b border-border">
        <div className="flex gap-6">
          {[
            { id: "Used", icon: Clock, label: "Used Prompts" },
            { id: "Saved", icon: Bookmark, label: "Saved Prompts" },
            { id: "Liked", icon: Heart, label: "Liked Prompts" }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => setTab(item.id)} 
              className={`relative flex items-center gap-2 px-1 py-4 text-base font-bold transition-colors ${tab === item.id ? "text-text-primary" : "text-text-muted hover:text-text-primary"}`}
            >
              <item.icon size={18} />
              {item.label}
              {tab === item.id && <motion.span layoutId="library-tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-cyan" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-bg-card px-3 focus-within:border-cyan">
        <Search className="text-text-muted" size={18} />
        <input 
          value={query} 
          onChange={(event) => setQuery(event.target.value)} 
          placeholder={`Search ${tab.toLowerCase()} prompts`} 
          className="w-full bg-transparent py-3 outline-none placeholder:text-text-muted" 
        />
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => <PromptCardSkeleton key={i} />)}
              </div>
            ) : activePrompts.length ? (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activePrompts.map((prompt) => (
                  <motion.div key={prompt._id || prompt.id} variants={scaleIn}>
                    <PromptCard {...prompt} id={prompt._id || prompt.id} isOwned={tab === "Used"} showLike />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <EmptyState 
                icon={tab === "Saved" ? Bookmark : tab === "Liked" ? Heart : LibraryIcon} 
                title={`No ${tab.toLowerCase()} prompts`} 
                message={
                  tab === "Used" ? "Explore the marketplace and unlock your first prompt." :
                  tab === "Saved" ? "You haven't saved any prompts yet. Bookmark prompts to find them easily later." :
                  "You haven't liked any prompts. Show some love to creators by liking their prompts!"
                } 
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default Library;
