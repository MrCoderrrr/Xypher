import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCircle2, X } from "lucide-react";
import Button from "../components/Button";
import PromptCard from "../components/PromptCard";
import { categories } from "../data/mockData";

function UploadPrompt() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [tags, setTags] = useState(["launch"]);
  const [tagText, setTagText] = useState("");
  const [form, setForm] = useState({ title: "", category: "Writing", description: "", promptContent: "", sampleOutput: "", price: 80 });
  const [errors, setErrors] = useState({});
  const detected = useMemo(() => [...new Set([...form.promptContent.matchAll(/\{\{\s*([\w.-]+)\s*\}\}/g)].map((m) => m[1]))], [form.promptContent]);
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const addTag = (event) => {
    if (event.key !== "Enter" || !tagText.trim()) return;
    event.preventDefault();
    setTags((items) => [...new Set([...items, tagText.trim()])]);
    setTagText("");
  };
  const validate = () => {
    const required = step === 1 ? ["title", "description"] : step === 2 ? ["promptContent", "sampleOutput"] : ["price"];
    const next = {};
    required.forEach((key) => { if (!String(form[key] || "").trim()) next[key] = "Required"; });
    setErrors(next);
    return !Object.keys(next).length;
  };
  const next = () => { if (validate()) setStep((value) => value + 1); };

  if (done) return <section className="mx-auto max-w-[1400px] px-4 py-16 text-center sm:px-6 lg:px-8"><CheckCircle2 className="mx-auto text-success" size={56} /><h1 className="mt-5 font-heading text-4xl font-black">Submitted for review</h1><p className="mt-3 text-text-muted">Your prompt is now in the admin review queue.</p><Link to="/creator-dashboard" className="mt-6 inline-flex"><Button>Back to Dashboard</Button></Link></section>;

  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-4xl font-black">Upload Prompt</h1>
      <div className="mt-8 flex items-center">
        {[1, 2, 3].map((item) => <div key={item} className="flex flex-1 items-center"><div className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${item < step ? "border-indigo-500 bg-indigo-500" : item === step ? "border-indigo-500 text-indigo-300" : "border-border text-text-muted"}`}>{item < step ? <Check size={18} /> : item}</div>{item < 3 && <div className={`h-1 flex-1 transition ${item < step ? "bg-indigo-500" : "bg-border"}`} />}</div>)}
      </div>
      <div className="mt-2 grid grid-cols-3 text-base text-text-muted"><span>Basic Info</span><span>Content</span><span>Pricing & Preview</span></div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-bg-card p-6">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.25 }}>
            {step === 1 && <div className="space-y-4"><Field label="Title" value={form.title} error={errors.title} onChange={(v) => setField("title", v)} placeholder="Prompt title" /><label className="block text-sm font-semibold text-text-muted">Category<select value={form.category} onChange={(e) => setField("category", e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-bg-card px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">{categories.map((c) => <option key={c}>{c}</option>)}</select></label><div><label className="text-sm font-semibold text-text-muted">Tags</label><input value={tagText} onChange={(e) => setTagText(e.target.value)} onKeyDown={addTag} placeholder="Type tag and press Enter" className="mt-2 w-full rounded-lg border border-border bg-bg-card px-4 py-3 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" /><div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <button key={tag} onClick={() => setTags((items) => items.filter((item) => item !== tag))} className="rounded-full bg-indigo-500/10 px-3 py-1 text-sm text-indigo-200">{tag} ×</button>)}</div></div><Area label="Short description" value={form.description} error={errors.description} onChange={(v) => setField("description", v)} placeholder="Describe the outcome and audience" /></div>}
            {step === 2 && <div className="space-y-4"><Area label="Prompt Content" value={form.promptContent} error={errors.promptContent} onChange={(v) => setField("promptContent", v)} placeholder="Write prompt with {{variables}}" tall mono /><div className="rounded-xl border border-border bg-bg-elevated p-4"><p className="font-semibold">Detected variables</p><div className="mt-3 flex flex-wrap gap-2">{detected.length ? detected.map((name) => <span key={name} className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 font-mono text-sm text-cyan">{`{{${name}}}`}</span>) : <span className="text-sm text-text-muted">No variables detected yet.</span>}</div></div><Area label="Sample output" value={form.sampleOutput} error={errors.sampleOutput} onChange={(v) => setField("sampleOutput", v)} placeholder="Paste a strong example output" /></div>}
            {step === 3 && <div className="grid gap-8 lg:grid-cols-2"><div className="space-y-4"><label className="text-sm font-semibold text-text-muted">Token price<input type="range" min="20" max="200" value={form.price} onChange={(e) => setField("price", e.target.value)} className="mt-4 w-full" /></label><Field label="Price" type="number" value={form.price} error={errors.price} onChange={(v) => setField("price", v)} placeholder="80" /><div className="rounded-xl border border-cyan/25 bg-cyan/10 p-4 text-cyan">You'll earn {Math.round(Number(form.price || 0) * 0.75)} tokens (75%) per sale</div></div><PromptCard id="preview" title={form.title || "Prompt Preview"} description={form.description || "Marketplace card preview updates as you fill the form."} category={form.category} price={Number(form.price || 0)} creatorName="Maya Iyer" creatorInitials="MI" creatorColor="#6366F1" salesCount={0} rating={5} previewImage="https://picsum.photos/seed/preview/400/225" /></div>}
          </motion.div>
        </AnimatePresence>
        <div className="mt-8 flex justify-between"><Button variant="secondary" disabled={step === 1} onClick={() => setStep((value) => value - 1)}>Back</Button>{step < 3 ? <Button onClick={next}>Next</Button> : <Button onClick={() => validate() && setDone(true)}>Submit for Review</Button>}</div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, error, placeholder, type = "text" }) {
  return <label className="block text-sm font-semibold text-text-muted">{label}<input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`mt-2 w-full rounded-lg border bg-bg-card px-4 py-3 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${error ? "border-red-500 ring-2 ring-red-500/20" : "border-border"}`} />{error && <p className="mt-1 text-sm text-red-400">{error}</p>}</label>;
}
function Area({ label, value, onChange, error, placeholder, tall, mono }) {
  return <label className="block text-sm font-semibold text-text-muted">{label}<textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`mt-2 w-full rounded-lg border bg-bg-card px-4 py-3 outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 ${tall ? "min-h-56" : "min-h-28"} ${mono ? "font-mono" : ""} ${error ? "border-red-500 ring-2 ring-red-500/20" : "border-border"}`} />{error && <p className="mt-1 text-sm text-red-400">{error}</p>}</label>;
}

export default UploadPrompt;
