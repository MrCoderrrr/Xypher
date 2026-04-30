import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { creators, payouts } from "../data/mockData";

function ManagePayouts() {
  const [tab, setTab] = useState("pending");
  const [rows, setRows] = useState(payouts);
  const [target, setTarget] = useState(null);
  const visible = useMemo(() => rows.filter((payout) => payout.status === tab), [rows, tab]);
  const process = (status) => { setRows((items) => items.map((item) => item.id === target.id ? { ...item, status } : item)); setTarget(null); };
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-black">Manage Payouts</h1>
      <div className="mt-6 flex gap-2">{["pending", "processed", "failed"].map((item) => <button key={item} onClick={() => setTab(item)} className={`rounded-md px-4 py-2 text-base font-bold capitalize ${tab === item ? "bg-cyan/10 text-cyan" : "text-text-muted hover:bg-bg-card hover:text-cyan"}`}>{item}</button>)}</div>
      <div className="mt-6 overflow-hidden rounded-md border border-border bg-bg-card"><table className="w-full text-sm"><thead className="bg-bg-secondary text-left text-text-muted"><tr><th className="p-4">Creator</th><th>Amount</th><th>Method</th><th>Requested</th><th>Status</th><th>Actions</th></tr></thead><tbody>{visible.map((payout) => { const creator = creators.find((item) => item.id === payout.creatorId); return <tr key={payout.id} className="border-t border-border"><td className="p-4 font-semibold">{creator?.name}</td><td className="text-cyan">₹{payout.amount.toLocaleString()}</td><td>{payout.method}</td><td>{payout.date}</td><td><Badge variant="status" value={payout.status}>{payout.status}</Badge></td><td>{payout.status === "pending" && <Button size="sm" onClick={() => setTarget(payout)}>Process</Button>}</td></tr>; })}</tbody></table></div>
      <Modal open={Boolean(target)} onClose={() => setTarget(null)} title="Process payout"><p className="text-text-muted">Confirm payout action for ₹{target?.amount.toLocaleString()}.</p><div className="mt-5 flex gap-3"><Button onClick={() => process("processed")}>Mark Processed</Button><Button variant="danger" onClick={() => process("failed")}>Mark Failed</Button></div></Modal>
    </section>
  );
}

export default ManagePayouts;
