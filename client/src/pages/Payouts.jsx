import { useState } from "react";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { payouts } from "../data/mockData";

function Payouts() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-md border border-cyan/30 bg-cyan/10 p-8"><p className="text-base text-cyan">Available balance</p><p className="mt-2 font-heading text-5xl font-black">₹18,450</p><Button className="mt-6" onClick={() => setOpen(true)}>Request Payout</Button></div>
      <div className="mt-8 overflow-hidden rounded-md border border-border bg-bg-card"><table className="w-full text-sm"><thead className="bg-bg-secondary text-left text-text-muted"><tr><th className="p-4">Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Admin note</th></tr></thead><tbody>{payouts.map((payout) => <tr key={payout.id} className="border-t border-border"><td className="p-4 font-semibold">₹{payout.amount.toLocaleString()}</td><td>{payout.method}</td><td><Badge variant="status" value={payout.status}>{payout.status}</Badge></td><td>{payout.date}</td><td className="text-text-muted">{payout.adminNote}</td></tr>)}</tbody></table></div>
      <Modal open={open} onClose={() => setOpen(false)} title="Request Payout"><div className="space-y-4"><input placeholder="Amount" className="w-full rounded-md border border-border bg-bg-secondary px-4 py-3 outline-none focus:border-cyan" /><select className="w-full rounded-md border border-border bg-bg-secondary px-4 py-3 outline-none focus:border-cyan"><option>UPI</option><option>Bank</option></select><input placeholder="Payment details" className="w-full rounded-md border border-border bg-bg-secondary px-4 py-3 outline-none focus:border-cyan" /><Button className="w-full" onClick={() => setOpen(false)}>Submit Request</Button></div></Modal>
    </section>
  );
}

export default Payouts;
