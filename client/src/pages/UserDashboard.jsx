import { Link } from "react-router-dom";
import { IndianRupee, Library, ShoppingBag, Sparkles, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Button from "../components/Button";
import StatCard from "../components/StatCard";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

function UserDashboard() {
  const { user } = useAuth();
  const { data: dashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data } = await api.get("/users/dashboard");
      return data;
    }
  });
  const stats = dashboard?.stats || {};
  const purchases = dashboard?.purchases || [];
  const generations = dashboard?.generations || [];
  const trend = stats?.trend || {};
  const formatTrend = (value) => {
    if (value === undefined || value === null) return undefined;
    const rounded = Math.round(value);
    return `${rounded >= 0 ? "+" : ""}${rounded}%`;
  };
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><h1 className="font-heading text-4xl font-black">Welcome back, {user?.name || "User"}</h1><p className="mt-2 text-text-muted">Your prompt library and latest AI runs.</p></div>
        <div className="flex gap-3"><Link to="/pricing"><Button>Buy Tokens</Button></Link><Link to="/explore"><Button variant="secondary">Explore Prompts</Button></Link></div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <StatCard icon={Wallet} label="Token balance" value={(user?.tokenBalance || 0).toLocaleString()} />
        <StatCard icon={Library} label="Prompts owned" value={stats.promptsOwned || 0} />
        <StatCard icon={Sparkles} label="Generations run" value={stats.generationsRun || 0} trend={formatTrend(trend.generationsWeeklyPercent)} />
        <StatCard icon={IndianRupee} label="Money saved" value={`₹${((stats.tokensSpent || 0) * 10).toLocaleString()}`} trend={formatTrend(trend.tokensWeeklyPercent)} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-card p-6"><h2 className="font-heading text-xl font-semibold">Recent Activity</h2><div className="mt-5 space-y-4">{purchases.slice(0, 5).map((purchase, index) => { const prompt = purchase.prompt; const ownerName = prompt?.creator?.name || prompt?.ownerName || "Unknown owner"; return <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }} key={purchase._id || index} className="flex gap-4 border-l border-indigo-500/30 pl-4"><ShoppingBag className="mt-1 text-indigo-400" size={18} /><div><p className="font-semibold">{prompt?.title || "Unknown Prompt"}</p><p className="text-sm text-text-muted">Owner: {ownerName}</p><p className="text-sm text-text-muted">{new Date(purchase.createdAt).toLocaleDateString()} · {purchase.tokensSpent} tokens spent</p></div></motion.div>; })}</div></div>
        <div className="rounded-xl border border-border bg-bg-card p-6"><h2 className="font-heading text-xl font-semibold">Recent generations</h2><div className="mt-4 space-y-4">{generations.slice(0, 5).map((generation) => { const prompt = generation.prompt; return <div key={generation._id} className="rounded-xl bg-bg-elevated p-4"><p className="font-semibold">{prompt?.title || "Unknown"}</p><p className="mt-1 line-clamp-2 text-sm text-text-muted">{generation.output?.slice(0, 100)}...</p></div>; })}</div></div>
      </div>
    </section>
  );
}

export default UserDashboard;
