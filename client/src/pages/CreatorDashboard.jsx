import { Link } from "react-router-dom";
import { useState } from "react";
import { BadgeIndianRupee, BarChart3, Plus, Wallet } from "lucide-react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import StatCard from "../components/StatCard";
import { earningsBars, enrichedPrompts } from "../data/mockData";

function CreatorDashboard() {
  const [sort, setSort] = useState("sales");
  const mine = enrichedPrompts.filter((prompt) => prompt.creatorId === "maya-iyer");
  const barHeights = ["h-[29%]", "h-[44%]", "h-[22%]", "h-[59%]", "h-[78%]", "h-[66%]", "h-full"];
  const sorted = [...mine].sort((a, b) => sort === "name" ? a.title.localeCompare(b.title) : b.salesCount - a.salesCount);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-heading text-4xl font-black">Creator Dashboard</h1><p className="mt-2 text-text-muted">Track sales, earnings, prompt performance, and payout readiness.</p></div><div className="flex gap-3"><Link to="/upload"><Button><Plus size={16} /> Upload New Prompt</Button></Link><Link to="/payouts"><Button variant="secondary">Request Payout</Button></Link></div></div>
      <div className="mt-8 grid gap-4 md:grid-cols-4"><StatCard icon={BadgeIndianRupee} label="Total earnings" value="₹1.86L" trend="+18%" /><StatCard icon={Wallet} label="Available balance" value="₹18.4K" trend="+6%" /><StatCard icon={BarChart3} label="Prompts live" value={mine.length} /><StatCard icon={BarChart3} label="Total sales" value="4,820" trend="+9%" /></div>
      <div className="mt-8 rounded-xl border border-border bg-bg-card p-6"><h2 className="font-heading text-2xl font-bold">Last 7 days earnings</h2><div className="mt-6 flex h-56 items-end gap-3">{earningsBars.map((value, index) => <div key={index} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"><div className={`w-full origin-bottom rounded-t-lg bg-gradient-to-t from-indigo-700 to-cyan-400 transition-all duration-700 ${barHeights[index]}`} /><span className="pointer-events-none absolute bottom-full mb-2 hidden rounded bg-bg-elevated px-2 py-1 text-xs group-hover:block">D{index + 1}: ₹{value}</span><span className="text-xs text-text-muted">D{index + 1}</span></div>)}</div></div>
      <div className="mt-8 overflow-hidden rounded-xl border border-border bg-bg-card"><table className="w-full text-sm"><thead className="bg-bg-elevated text-left text-text-muted"><tr><th className="p-4 cursor-pointer" onClick={() => setSort("name")}>Name</th><th>Status</th><th className="cursor-pointer" onClick={() => setSort("sales")}>Sales</th><th>Earnings</th><th>Actions</th></tr></thead><tbody>{sorted.map((prompt) => <tr key={prompt.id} className="border-t border-border"><td className="p-4 font-semibold">{prompt.title}</td><td><Badge variant="status" value={prompt.status}>{prompt.status}</Badge></td><td>{prompt.salesCount}</td><td className="text-cyan">₹{(prompt.salesCount * prompt.price * 0.75).toLocaleString()}</td><td><Button size="sm" variant="secondary">Edit</Button></td></tr>)}</tbody></table></div>
    </section>
  );
}

export default CreatorDashboard;
