import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import { enrichedPrompts } from "../data/mockData";

function ManagePrompts() {
  const [tab, setTab] = useState("all");
  const [rows, setRows] = useState(enrichedPrompts);
  const visible = useMemo(() => tab === "all" ? rows : rows.filter((prompt) => prompt.status === tab), [rows, tab]);
  const update = (id, status) => setRows((items) => items.map((item) => item.id === id ? { ...item, status } : item));
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-black">Manage Prompts</h1>
      <div className="mt-6 flex gap-2">{["all", "pending", "approved", "rejected"].map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-base font-bold capitalize ${tab === item ? "bg-cyan/10 text-cyan" : "text-text-muted hover:bg-bg-card hover:text-cyan"}`}>{item}</button>)}</div>
      <div className="mt-6 overflow-hidden rounded-md border border-border bg-bg-card"><table className="w-full text-sm"><thead className="bg-bg-secondary text-left text-text-muted"><tr><th className="p-4">Prompt title</th><th>Creator</th><th>Category</th><th>Price</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>{visible.map((prompt) => <tr key={prompt.id} className="border-t border-border"><td className="p-4 font-semibold">{prompt.title}</td><td>{prompt.creatorName}</td><td>{prompt.category}</td><td className="text-cyan">{prompt.price}</td><td><Badge variant="status" value={prompt.status}>{prompt.status}</Badge></td><td className="text-text-muted">Apr 2026</td><td className="space-x-2"><Button size="sm" onClick={() => update(prompt.id, "approved")}>Approve</Button><Button size="sm" variant="danger" onClick={() => update(prompt.id, "rejected")}>Reject</Button></td></tr>)}</tbody></table></div>
    </section>
  );
}

export default ManagePrompts;
