import { BadgeIndianRupee, Clock, Sparkles, Users, Wallet, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import { platformStats } from "../data/mockData";

function AdminDashboard() {
  const stats = [
    { icon: Users, label: "Users", value: platformStats.users.toLocaleString(), trend: "+12%" },
    { icon: Users, label: "Creators", value: platformStats.creators, trend: "+8%" },
    { icon: Wand2, label: "Prompts", value: platformStats.prompts.toLocaleString(), trend: "+16%" },
    { icon: Clock, label: "Pending prompts", value: platformStats.pendingPrompts },
    { icon: Wallet, label: "Pending payouts", value: platformStats.pendingPayouts },
    { icon: Sparkles, label: "Total generations", value: platformStats.generations.toLocaleString(), trend: "+22%" },
    { icon: BadgeIndianRupee, label: "Platform earnings", value: `₹${platformStats.platformEarnings.toLocaleString()}`, trend: "+14%" },
  ];
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-black">Admin Dashboard</h1>
      {platformStats.pendingPrompts > 0 && <div className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">{platformStats.pendingPrompts} prompts need review.</div>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-card p-6"><h2 className="font-heading text-2xl font-bold">Recent activity</h2><div className="mt-4 space-y-3">{["09:40 Maya requested payout of ₹18,450", "11:15 Brand Shot Studio crossed 1,800 sales", "13:20 New prompt pending review", "15:45 Zara updated creator profile"].map((item) => <div key={item} className="rounded-lg bg-bg-elevated p-4 text-sm text-text-muted">{item}</div>)}</div></div>
        <div className="grid gap-4">{[["Review prompts", "/admin/prompts"], ["Manage creators", "/admin/creators"], ["Process payouts", "/admin/payouts"]].map(([label, to]) => <Link key={label} to={to} className="rounded-xl border border-border bg-bg-card p-6 font-heading text-lg font-semibold hover:border-indigo-500 hover:shadow-glow">{label}</Link>)}</div>
      </div>
    </section>
  );
}

export default AdminDashboard;
