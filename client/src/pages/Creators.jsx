import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import EmptyState from "../components/EmptyState";
import CreatorCard from "../components/CreatorCard";
import { creators as mockCreators } from "../data/mockData";
import { scaleIn, staggerContainer } from "../utils/animations";

function Creators() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");

  const filteredCreators = useMemo(() => {
    let list = mockCreators.filter((creator) => 
      creator.name.toLowerCase().includes(search.toLowerCase()) ||
      creator.bio?.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === "popular") list = [...list].sort((a, b) => (b.followers || 0) - (a.followers || 0));
    if (sort === "rating") list = [...list].sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
    if (sort === "prompts") list = [...list].sort((a, b) => (b.totalPrompts || 0) - (a.totalPrompts || 0));

    return list;
  }, [search, sort]);

  return (
    <div className="mx-auto flex max-w-[1400px] gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <main className="min-w-0 flex-1">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-heading text-5xl font-black">Explore Creators</h1>
            <p className="mt-2 text-lg text-text-muted">
              Discover top prompt engineers and AI workflow designers.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 focus-within:border-indigo-500">
              <Search size={16} className="text-text-muted" />
              <input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Search creators..." 
                className="w-full bg-transparent py-2.5 outline-none placeholder:text-slate-600 sm:w-48" 
              />
            </div>
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)} 
              className="rounded-xl border border-border bg-bg-card px-4 py-2.5 outline-none focus:border-indigo-500"
            >
              <option value="popular">Most Followers</option>
              <option value="rating">Highest Rated</option>
              <option value="prompts">Most Prompts</option>
            </select>
          </div>
        </div>

        {filteredCreators.length ? (
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCreators.map((creator) => (
              <motion.div key={creator.id} variants={scaleIn}>
                <CreatorCard creator={creator} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <EmptyState icon={Search} title="No creators match your search" message="Try adjusting your search terms." />
        )}
      </main>
    </div>
  );
}

export default Creators;
