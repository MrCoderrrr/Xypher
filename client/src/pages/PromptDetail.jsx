import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CheckCircle2, Copy, Library, Star, Zap } from "lucide-react";
import api from "../utils/axios";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { promptView } from "../utils/shape";

function PromptDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["prompt", id], queryFn: async () => (await api.get(`/prompts/${id}`)).data });
  const { data: reviewsData } = useQuery({ queryKey: ["reviews", id], queryFn: async () => (await api.get(`/prompts/${id}/reviews`)).data });
  const buy = useMutation({ mutationFn: async () => (await api.post(`/prompts/${id}/purchase`)).data, onSuccess: () => { toast.success("Prompt purchased"); qc.invalidateQueries(); } });
  if (isLoading) return <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">Loading...</div>;
  const prompt = promptView(data.prompt);
  const creator = data.prompt.creator || {};
  const reviews = reviewsData?.reviews || [];
  return (
    <section className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:grid-cols-[60%_40%]">
      <div>
        <nav className="text-base text-text-muted"><Link to="/explore">Explore</Link> › {prompt.category} › <span className="text-text-primary">{prompt.title}</span></nav>
        <h1 className="mt-4 font-heading text-4xl font-black">{prompt.title}</h1>
        <div className="mt-4 flex flex-wrap gap-3"><Badge>{prompt.category}</Badge>{prompt.tags.map((t) => <span key={t} className="rounded-full border border-border px-3 py-1 text-sm text-text-muted">#{t}</span>)}<span className="text-amber-300">★ {prompt.rating}</span><span className="text-text-muted">↑ {prompt.salesCount} sales</span></div>
        <Link to={`/creator/${creator._id}`} className="mt-6 flex w-fit items-center gap-3 rounded-xl border border-border bg-bg-card p-4"><Avatar src={creator.avatar} name={creator.name} /><div><p className="font-semibold">{creator.name} ✓</p><p className="text-base text-cyan">View Profile →</p></div></Link>
        <div className="my-8 border-t border-border" />
        <p className="text-base leading-relaxed text-text-muted">{prompt.description}</p>
        <section className="mt-8"><h2 className="font-heading text-3xl font-bold">What's included</h2><div className="mt-4 grid gap-3">{prompt.whatYouGet.map((x) => <p key={x} className="flex gap-2 text-text-muted"><CheckCircle2 className="text-success" />{x}</p>)}</div></section>
        <section className="mt-8"><h2 className="font-heading text-3xl font-bold">Sample Output</h2><pre className="mono mt-4 whitespace-pre-wrap rounded-r-xl border-l-4 border-indigo-500 bg-[#060D1A] p-4 text-cyan">{prompt.sampleOutput}</pre></section>
        <section className="mt-8"><h2 className="font-heading text-3xl font-bold">Variables</h2><div className="mt-4 flex flex-wrap gap-2">{prompt.variables.map((v) => <span key={v.name} className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 font-mono text-cyan">{`{{${v.name}}}`} <span className="font-sans text-text-muted">{v.description}</span></span>)}</div></section>
        <section className="mt-8"><h2 className="font-heading text-3xl font-bold">Reviews</h2><div className="mt-4 space-y-3">{reviews.map((r) => <div key={r._id} className="rounded-xl border border-border bg-bg-card p-4"><div className="flex text-amber-300">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div><p className="mt-2 text-text-muted">{r.text}</p></div>)}</div></section>
      </div>
      <aside className="h-fit rounded-2xl border border-border bg-bg-card p-6 lg:sticky lg:top-24">
        <p className="flex items-center gap-2 font-heading text-4xl font-black text-cyan"><Zap fill="currentColor" /> {prompt.price}</p>
        <Button loading={buy.isPending} onClick={() => buy.mutate()} className="mt-5 w-full animate-glow">Buy Prompt</Button>
        <Link to={`/generate/${prompt.id}`} className="mt-3 block"><Button variant="secondary" className="w-full"><Library /> Run Generation →</Button></Link>
        <div className="my-6 border-t border-border" />
        <p className="text-text-muted">{prompt.salesCount} sales · {prompt.rating} rating · {prompt.category}</p>
        <Button variant="ghost" className="mt-4 w-full" onClick={() => { navigator.clipboard?.writeText(location.href); toast.success("Copied"); }}><Copy size={16} /> Share</Button>
      </aside>
    </section>
  );
}
export default PromptDetail;
