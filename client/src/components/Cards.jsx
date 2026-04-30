import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, Coins, Star } from "lucide-react";

export function PageHeader({ eyebrow, title, body, action }) {
  return (
    <section className="mb-8 flex flex-col justify-between gap-5 border-b border-zinc-200 pb-7 lg:flex-row lg:items-end">
      <div className="max-w-3xl">
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">{title}</h1>
        {body && <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">{body}</p>}
      </div>
      {action}
    </section>
  );
}

export function StatCard({ label, value, tone = "default" }) {
  const tones = {
    default: "border-zinc-200 bg-white",
    green: "border-emerald-200 bg-emerald-50",
    blue: "border-sky-200 bg-sky-50",
    amber: "border-amber-200 bg-amber-50",
  };
  return (
    <div className={`rounded-md border p-5 ${tones[tone]}`}>
      <p className="text-sm font-medium text-zinc-600">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
    </div>
  );
}

export function PromptCard({ prompt }) {
  return (
    <article className="group overflow-hidden rounded-md border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link to={`/prompt/${prompt.id}`}>
        <img className="h-44 w-full object-cover" src={prompt.samples[0]} alt={prompt.title} />
      </Link>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs font-semibold uppercase text-zinc-700">
            {prompt.category}
          </span>
          <span className="flex items-center gap-1 text-sm font-medium text-amber-700">
            <Star size={15} fill="currentColor" /> {prompt.rating}
          </span>
        </div>
        <Link to={`/prompt/${prompt.id}`} className="text-lg font-semibold text-zinc-950 group-hover:text-emerald-700">
          {prompt.title}
        </Link>
        <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-600">{prompt.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1 font-semibold text-zinc-950">
            <Coins size={16} /> {prompt.price}
          </span>
          <Link className="flex items-center gap-1 text-sm font-semibold text-emerald-700" to={`/generate/${prompt.id}`}>
            Use <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function StatusBadge({ status }) {
  const style = {
    approved: "bg-emerald-100 text-emerald-800",
    completed: "bg-emerald-100 text-emerald-800",
    processed: "bg-emerald-100 text-emerald-800",
    pending: "bg-amber-100 text-amber-800",
    processing: "bg-amber-100 text-amber-800",
    rejected: "bg-rose-100 text-rose-800",
    failed: "bg-rose-100 text-rose-800",
  }[status] || "bg-zinc-100 text-zinc-700";

  const Icon = ["approved", "completed", "processed"].includes(status) ? CheckCircle2 : Clock;
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold capitalize ${style}`}>
      <Icon size={13} /> {status}
    </span>
  );
}

export function EmptyState({ title, body }) {
  return (
    <div className="rounded-md border border-dashed border-zinc-300 bg-white p-8 text-center">
      <p className="font-semibold text-zinc-950">{title}</p>
      <p className="mt-2 text-sm text-zinc-600">{body}</p>
    </div>
  );
}
