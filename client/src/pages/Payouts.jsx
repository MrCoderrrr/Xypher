import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

function Payouts() {
  const { user, refetchUser } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("upi");
  const [paymentDetails, setPaymentDetails] = useState("");
  const { data } = useQuery({
    queryKey: ["my-payouts"],
    queryFn: async () => (await api.get("/payouts/my")).data,
  });
  const requestMutation = useMutation({
    mutationFn: async () =>
      (await api.post("/payouts/request", { amount: Number(amount), method, paymentDetails })).data,
    onSuccess: async () => {
      setOpen(false);
      setAmount("");
      setPaymentDetails("");
      queryClient.invalidateQueries({ queryKey: ["my-payouts"] });
      await refetchUser();
    },
  });
  const payouts = data?.payouts || [];

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-md border border-cyan/30 bg-cyan/10 p-8"><p className="text-base text-cyan">Available balance</p><p className="mt-2 font-heading text-5xl font-black">₹{(user?.availableBalance || 0).toLocaleString()}</p><Button className="mt-6" onClick={() => setOpen(true)}>Request Payout</Button></div>
      <div className="mt-8 overflow-hidden rounded-md border border-border bg-bg-card"><table className="w-full text-sm"><thead className="bg-bg-secondary text-left text-text-muted"><tr><th className="p-4">Amount</th><th>Method</th><th>Status</th><th>Date</th><th>Admin note</th></tr></thead><tbody>{payouts.map((payout) => <tr key={payout._id} className="border-t border-border"><td className="p-4 font-semibold">₹{payout.amount.toLocaleString()}</td><td>{payout.method}</td><td><Badge variant="status" value={payout.status}>{payout.status}</Badge></td><td>{payout.createdAt ? new Date(payout.createdAt).toLocaleDateString() : "-"}</td><td className="text-text-muted">{payout.adminNote || "-"}</td></tr>)}</tbody></table></div>
      <Modal open={open} onClose={() => setOpen(false)} title="Request Payout"><div className="space-y-4"><input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" className="w-full rounded-md border border-border bg-bg-secondary px-4 py-3 outline-none focus:border-cyan" /><select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full rounded-md border border-border bg-bg-secondary px-4 py-3 outline-none focus:border-cyan"><option value="upi">UPI</option><option value="bank">Bank</option></select><input value={paymentDetails} onChange={(e) => setPaymentDetails(e.target.value)} placeholder="Payment details" className="w-full rounded-md border border-border bg-bg-secondary px-4 py-3 outline-none focus:border-cyan" /><Button className="w-full" loading={requestMutation.isPending} onClick={() => requestMutation.mutate()}>Submit Request</Button></div></Modal>
    </section>
  );
}

export default Payouts;
