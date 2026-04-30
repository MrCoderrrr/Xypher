import { useState } from "react";
import { CheckCircle2, ChevronDown, CreditCard, Library, Sparkles } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../components/Button";
import api from "../utils/axios";
import { useAuth } from "../context/AuthContext";

const faqs = ["Do tokens expire?", "Can I refund a prompt?", "How many tokens does generation cost?", "Can teams share tokens?", "Are creators paid in tokens?", "Can I buy more anytime?"];

function Pricing() {
  const { user, refetchUser } = useAuth();
  const [open, setOpen] = useState(0);
  const { data: packsData } = useQuery({
    queryKey: ["packs"],
    queryFn: async () => {
      const { data } = await api.get("/payments/packs");
      return data;
    }
  });
  const buyMutation = useMutation({
    mutationFn: async (packId) => {
      const { data } = await api.post("/payments/order", { packId });
      return data;
    },
    onSuccess: async (data) => {
      if (data.devMode) {
        toast.success(`Added ${data.pack.tokens} tokens!`);
        await refetchUser();
      } else {
        toast.success("Order created! Complete payment to add tokens.");
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || "Purchase failed")
  });
  const tokenPacks = packsData?.packs || [];
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-5xl font-black">Token Packs</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">Buy tokens once, unlock premium prompts, and run generations whenever you need better AI outputs.</p>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {tokenPacks.map((pack) => (
          <div key={pack.id} className={`rounded-md border p-6 ${pack.popular ? "border-cyan bg-cyan/10 shadow-glow" : "border-border bg-bg-card"}`}>
            {pack.popular && <p className="mb-4 text-sm font-semibold text-cyan">Most Popular</p>}
            <h2 className="font-heading text-2xl font-bold">{pack.name}</h2>
            <p className="mt-2 text-text-muted">{pack.tokens} tokens</p>
            <p className="mt-5 font-heading text-4xl font-bold">₹{pack.priceINR || pack.price}</p>
            <div className="mt-6 space-y-3">{(pack.features || []).map((feature) => <p key={feature} className="flex gap-2 text-sm text-text-muted"><CheckCircle2 className="text-success" size={16} /> {feature}</p>)}</div>
            <Button className="mt-6 w-full" variant={pack.popular ? "primary" : "secondary"} onClick={() => buyMutation.mutate(pack.id)} loading={buyMutation.isPending}>Buy Tokens</Button>
          </div>
        ))}
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[{ icon: CreditCard, title: "Buy tokens" }, { icon: Library, title: "Unlock prompts" }, { icon: Sparkles, title: "Run outputs" }].map((item) => <div key={item.title} className="rounded-md border border-border bg-bg-card p-6"><item.icon className="text-cyan" /><h3 className="mt-4 font-heading text-xl font-semibold">{item.title}</h3><p className="mt-2 text-sm text-text-muted">Tokens keep checkout fast and let you use Xypher across marketplace and generation flows.</p></div>)}
      </div>
      <div className="mt-16 max-w-3xl">
        <h2 className="font-heading text-4xl font-black">FAQ</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((faq, index) => <button key={faq} onClick={() => setOpen(open === index ? -1 : index)} className="w-full rounded-md border border-border bg-bg-card p-4 text-left hover:border-cyan"><span className="flex items-center justify-between font-semibold">{faq}<ChevronDown className={open === index ? "rotate-180 text-cyan" : "text-text-muted"} /></span>{open === index && <p className="mt-3 text-sm leading-6 text-text-muted">Tokens are account credits used to buy prompts and run generations. More detailed billing rules can be added when production payments go live.</p>}</button>)}
        </div>
      </div>
    </section>
  );
}

export default Pricing;
