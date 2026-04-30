import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../components/Avatar";
import Button from "../components/Button";
import { creators } from "../data/mockData";

function ManageCreators() {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => creators.filter((creator) => creator.name.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-black">Manage Creators</h1>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search creators" className="mt-6 w-full rounded-md border border-border bg-bg-card px-4 py-3 outline-none placeholder:text-text-muted focus:border-cyan" />
      <div className="mt-6 overflow-hidden rounded-md border border-border bg-bg-card"><table className="w-full text-sm"><thead className="bg-bg-secondary text-left text-text-muted"><tr><th className="p-4">Creator</th><th>Email</th><th>Prompts</th><th>Total earnings</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{visible.map((creator) => <tr key={creator.id} className="border-t border-border"><td className="p-4"><div className="flex items-center gap-3"><Avatar initials={creator.avatarInitials} color={creator.avatarColor} name={creator.name} /><span className="font-semibold">{creator.name}</span></div></td><td>{creator.email}</td><td>{creator.totalPrompts}</td><td className="text-cyan">₹{creator.totalEarnings.toLocaleString()}</td><td>{creator.joinedDate}</td><td className="space-x-2"><Link to={`/creator/${creator.id}`}><Button size="sm" variant="secondary">View Profile</Button></Link><Button size="sm" variant="danger">Revoke Creator</Button></td></tr>)}</tbody></table></div>
    </section>
  );
}

export default ManageCreators;
