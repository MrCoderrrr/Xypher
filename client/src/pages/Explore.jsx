import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Grid2X2, List, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import api from "../utils/axios";
import Button from "../components/Button";
import EmptyState from "../components/EmptyState";
import PromptCard from "../components/PromptCard";
import PromptCardSkeleton from "../components/PromptCardSkeleton";
import { categories, promptView } from "../utils/shape";
import { scaleIn, staggerContainer } from "../utils/animations";

function Explore() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [view, setView] = useState("grid");
  const { data, isLoading } = useQuery({
    queryKey: ["prompts", search, category, sort, page],
    queryFn: async () => (await api.get("/prompts", { params: { search, category, sort, page, limit: 9 } })).data,
  });
  const prompts = (data?.prompts || []).map(promptView);

  return (
    <div className="mx-auto flex max-w-[1400px] gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <aside className="hidden w-64 shrink-0 border-r border-white/5 pr-6 lg:block">
        <div className="sticky top-20">
          <div className="flex items-center gap-2 font-heading text-lg font-bold"><SlidersHorizontal className="text-cyan" /> Filters</div>
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 focus-within:border-indigo-500"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className="w-full bg-transparent py-3 outline-none placeholder:text-slate-600" /></div>
          <div className="mt-6 flex flex-wrap gap-2">{categories.map((c) => <button key={c} onClick={() => setCategory(category === c ? "" : c)} className={`rounded-full border px-3 py-1.5 text-sm font-medium ${category === c ? "border-indigo-500 bg-indigo-500/20 text-indigo-300" : "border-border text-text-muted"}`}>{c}</button>)}</div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="mt-6 w-full rounded-xl border border-border bg-bg-card px-4 py-3 outline-none"><option value="newest">Newest</option><option value="popular">Most Popular</option><option value="rated">Top Rated</option><option value="priceLow">Price: Low</option><option value="priceHigh">Price: High</option></select>
          <Button variant="ghost" className="mt-4 w-full" onClick={() => { setSearch(""); setCategory(""); setSort("popular"); }}><RotateCcw size={16} /> Reset</Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1">
        <div className="mb-6 flex items-end justify-between"><div><h1 className="font-heading text-5xl font-black">Explore Prompts</h1><p className="mt-2 text-lg text-text-muted">Showing {prompts.length} of {data?.total || 0}</p></div><div className="flex rounded-xl border border-border p-1"><button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "text-cyan" : "text-text-muted"}`}><Grid2X2 /></button><button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "text-cyan" : "text-text-muted"}`}><List /></button></div></div>
        {isLoading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <PromptCardSkeleton key={i} />)}</div> : prompts.length ? <motion.div variants={staggerContainer} initial="hidden" animate="visible" className={view === "grid" ? "grid gap-5 md:grid-cols-2 lg:grid-cols-3" : "grid gap-5"}>{prompts.map((p) => <motion.div key={p.id} variants={scaleIn}><PromptCard {...p} /></motion.div>)}</motion.div> : <EmptyState icon={Search} title="No prompts match your filters" message="Try resetting." />}
        <div className="mt-8 flex justify-center gap-2"><Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button><Button variant="secondary" disabled={page >= (data?.pages || 1)} onClick={() => setPage(page + 1)}>Next</Button></div>
      </main>
    </div>
  );
}
export default Explore;

variant = "ghost"
className = "mt-4 w-full"
onClick = {() => { setSearch(""); setCategory(""); setSort("popular"); }}
          >
  <RotateCcw size={16} /> Reset
          </Button >
        </div >
      </aside >

  <main className="min-w-0 flex-1">
    <div className="mb-6 flex items-end justify-between">
      <div>
        <h1 className="font-heading text-5xl font-black">Explore Prompts</h1>
        <p className="mt-2 text-lg text-text-muted">
          Showing {prompts.length} of {data?.total || 0} prompts
        </p>
      </div>
      <div className="flex rounded-xl border border-border p-1">
        <button
          onClick={() => handleLayoutChange("grid")}
          className={`rounded-lg p-2 transition-all duration-200 ${view === "grid"
              ? "bg-indigo-500/20 text-cyan"
              : "text-text-muted hover:text-white"
            }`}
        >
          <Grid2X2 />
        </button>
        <button
          onClick={() => handleLayoutChange("list")}
          className={`rounded-lg p-2 transition-all duration-200 ${view === "list"
              ? "bg-indigo-500/20 text-cyan"
              : "text-text-muted hover:text-white"
            }`}
        >
          <List />
        </button>
      </div>
    </div>

    {isLoading ? (
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <PromptCardSkeleton key={i} />
        ))}
      </div>
    ) : prompts.length ? (
      <div
        ref={stageRef}
        className={`card-stage ${dealPhase === "gather" ? "card-stage-gathering" : ""
          } ${view === "grid"
            ? "grid gap-5 md:grid-cols-2 lg:grid-cols-3"
            : "flex flex-col gap-5"
          }`}
      >
        {prompts.map((p, index) => (
          <div
            key={`${dealKey}-${p.id}`}
            ref={(el) => {
              cardRefs.current[index] = el;
            }}
            className={`card-slot ${dealPhase === "gather" ? "card-gather" : ""} ${dealPhase === "deal" ? "card-deal" : ""
              }`}
            style={{
              animationDelay: `${index * DEAL_STAGGER_MS}ms`,
              animationFillMode: "both",
              "--deal-rotate": `${(index % 2 === 0 ? -1 : 1) * (4 + (index % 3) * 3)}deg`,
              "--gather-rotate": `${(index % 2 === 0 ? 1 : -1) * (3 + (index % 4) * 2)}deg`,
              "--card-index": index,
              "--card-count": prompts.length || 1,
              "--pile-x": pileOffsets[index]?.x || 0,
              "--pile-y": pileOffsets[index]?.y || 0,
            }}
          >
            <PromptCard {...p} layout={view} />
          </div>
        ))}
      </div>
    ) : (
      <EmptyState
        icon={Search}
        title="No prompts match your filters"
        message="Try adjusting your search or resetting filters."
      />
    )}

    <div className="mt-8 flex justify-center gap-2">
      <Button variant="secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
        Prev
      </Button>
      <Button
        variant="secondary"
        disabled={page >= (data?.pages || 1)}
        onClick={() => setPage(page + 1)}
      >
        Next
      </Button>
    </div>
  </main>
    </div >
  );
}

export default Explore;