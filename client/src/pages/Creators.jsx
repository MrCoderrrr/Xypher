import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Star, TrendingUp } from "lucide-react";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import api from "../utils/axios";

function Creators() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("top");
  const [minRating, setMinRating] = useState("0");
  const [minSales, setMinSales] = useState("0");

  const { data, isLoading } = useQuery({
    queryKey: ["creators", search, page, sort, minRating, minSales],
    queryFn: async () =>
      (await api.get("/users/creators", { params: { search, page, limit: 12, sort, minRating, minSales } })).data,
  });

  const creators = useMemo(() => data?.creators || [], [data?.creators]);

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-heading text-5xl font-black">Creators</h1>
          <p className="mt-2 text-lg text-text-muted">
            Discover top prompt creators and open their profiles.
          </p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 focus-within:border-indigo-500">
        <Search size={16} />
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search creators..."
          className="w-full bg-transparent py-3 outline-none placeholder:text-slate-600"
        />
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <select
          value={sort}
          onChange={(e) => {
            setPage(1);
            setSort(e.target.value);
          }}
          className="rounded-xl border border-border bg-bg-card px-4 py-3 outline-none"
        >
          <option value="top">Top Earners</option>
          <option value="sales">Most Sales</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
        </select>
        <select
          value={minRating}
          onChange={(e) => {
            setPage(1);
            setMinRating(e.target.value);
          }}
          className="rounded-xl border border-border bg-bg-card px-4 py-3 outline-none"
        >
          <option value="0">Any Rating</option>
          <option value="3.5">3.5+ Rating</option>
          <option value="4">4.0+ Rating</option>
          <option value="4.5">4.5+ Rating</option>
        </select>
        <select
          value={minSales}
          onChange={(e) => {
            setPage(1);
            setMinSales(e.target.value);
          }}
          className="rounded-xl border border-border bg-bg-card px-4 py-3 outline-none"
        >
          <option value="0">Any Sales</option>
          <option value="10">10+ Sales</option>
          <option value="100">100+ Sales</option>
          <option value="500">500+ Sales</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-text-muted">Loading creators...</div>
      ) : creators.length ? (
        <div className="flex flex-col gap-5">
          {creators.map((creator) => (
            <Link
              key={creator._id}
              to={`/creator/${creator._id}`}
              className="group rounded-xl border border-border bg-bg-card p-5 transition-all hover:border-accent hover:shadow-[0_20px_40px_rgba(99,102,241,0.15)]"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex items-center gap-3 sm:w-72 sm:shrink-0">
                  <Avatar src={creator.avatar} name={creator.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-heading text-xl font-semibold group-hover:text-cyan">{creator.name}</p>
                    <p className="text-sm text-text-muted">
                      Joined {creator.createdAt ? new Date(creator.createdAt).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-3 text-sm leading-6 text-text-muted">
                    {creator.bio || "Prompt creator building reusable AI systems."}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-text-muted">
                    <span className="inline-flex items-center gap-1 text-amber-300">
                      <Star size={14} fill="currentColor" /> {Number(creator.avgRating || 0).toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <TrendingUp size={14} /> {creator.totalSales?.toLocaleString?.() || 0} sales
                    </span>
                    <span>{creator.totalPrompts || 0} prompts</span>
                    <span>{creator.followers?.length || 0} followers</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No creators found"
          message="Try a different search keyword."
        />
      )}

      <div className="mt-8 flex justify-center gap-2">
        <button
          className="rounded-lg border border-border bg-bg-card px-4 py-2 text-sm disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <button
          className="rounded-lg border border-border bg-bg-card px-4 py-2 text-sm disabled:opacity-50"
          disabled={page >= (data?.pages || 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default Creators;
