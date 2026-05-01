import { BadgeIndianRupee, Clock, Sparkles, Users, Wallet, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import StatCard from "../components/StatCard";
import api from "../utils/axios";

function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });
  const { data: activityData } = useQuery({
    queryKey: ["admin-activity"],
    queryFn: async () => (await api.get("/admin/activity")).data,
  });
  const platformStats = data?.stats || {
    users: 0,
    creators: 0,
    prompts: 0,
    pendingPrompts: 0,
    pendingPayouts: 0,
    generations: 0,
    platformEarnings: 0,
  };
  const stats = [
    { icon: Users, label: "Users", value: platformStats.users.toLocaleString() },
    { icon: Users, label: "Creators", value: platformStats.creators },
    { icon: Wand2, label: "Prompts", value: platformStats.prompts.toLocaleString() },
    { icon: Clock, label: "Pending prompts", value: platformStats.pendingPrompts },
    { icon: Wallet, label: "Pending payouts", value: platformStats.pendingPayouts },
    { icon: Sparkles, label: "Total generations", value: platformStats.generations.toLocaleString() },
    { icon: BadgeIndianRupee, label: "Platform earnings", value: `₹${platformStats.platformEarnings.toLocaleString()}` },
  ];
  const activity = activityData?.activity || [];
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-black">Admin Dashboard</h1>
      {platformStats.pendingPrompts > 0 && <div className="mt-6 rounded-xl border border-danger/30 bg-danger/10 p-4 text-danger">{platformStats.pendingPrompts} prompts need review.</div>}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-bg-card p-6">
          <h2 className="font-heading text-2xl font-bold">Recent activity</h2>
          <div className="mt-4 space-y-3">
            {activity.map((item) => (
              <div key={item.id} className="rounded-lg bg-bg-elevated p-4 text-sm text-text-muted">
                <div>{item.message}</div>
                <div className="mt-1 text-xs">{new Date(item.createdAt).toLocaleString()}</div>
              </div>
            ))}
            {!activity.length && <div className="rounded-lg bg-bg-elevated p-4 text-sm text-text-muted">No recent activity available yet.</div>}
          </div>
        </div>
        <div className="grid gap-4">{[["Review prompts", "/admin/prompts"], ["Manage creators", "/admin/creators"], ["Process payouts", "/admin/payouts"]].map(([label, to]) => <Link key={label} to={to} className="rounded-xl border border-border bg-bg-card p-6 font-heading text-lg font-semibold hover:border-indigo-500 hover:shadow-glow">{label}</Link>)}</div>
      </div>
    </section>
  );
}

export default AdminDashboard;
