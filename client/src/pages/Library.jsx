import { useMemo, useState } from "react";
import { Library as LibraryIcon, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import EmptyState from "../components/EmptyState";
import PromptCard from "../components/PromptCard";
import PromptCardSkeleton from "../components/PromptCardSkeleton";
import api from "../utils/axios";
import { promptView } from "../utils/shape";

function Library() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: async () => {
      const { data } = await api.get("/users/library");
      return data;
    }
  });
  const prompts = useMemo(
    () =>
      (data?.prompts || [])
        .map(promptView)
        .filter((prompt) => prompt?.title?.toLowerCase().includes(query.toLowerCase())),
    [data, query]
  );
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-black">Owned Prompts</h1>
      <div className="mt-6 flex items-center gap-2 rounded-md border border-border bg-bg-card px-3 focus-within:border-cyan">
        <Search className="text-text-muted" size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search owned prompts" className="w-full bg-transparent py-3 outline-none placeholder:text-text-muted" />
      </div>
      <div className="mt-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <PromptCardSkeleton key={i} />)}</div>
        ) : prompts.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{prompts.map((prompt) => <PromptCard key={prompt._id || prompt.id} {...prompt} id={prompt._id || prompt.id} isOwned />)}</div>
        ) : (
          <EmptyState icon={LibraryIcon} title="No prompts owned yet" message="Explore the marketplace and unlock your first prompt." />
        )}
      </div>
    </section>
  );
}

export default Library;
