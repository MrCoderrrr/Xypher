import { CheckCircle2, Clock, Shield, Sparkles, XCircle } from "lucide-react";

const statusStyles = {
  approved: "bg-success/15 text-success border-success/30",
  completed: "bg-success/15 text-success border-success/30",
  processed: "bg-success/15 text-success border-success/30",
  pending: "bg-amber-400/15 text-amber-300 border-amber-300/30",
  processing: "bg-amber-400/15 text-amber-300 border-amber-300/30",
  rejected: "bg-danger/15 text-danger border-danger/30",
  failed: "bg-danger/15 text-danger border-danger/30",
};

const roleStyles = {
  creator: "bg-cyan/15 text-cyan border-cyan/30",
  admin: "bg-accent/20 text-indigo-200 border-accent/40",
};

function Badge({ children, variant = "category", value }) {
  const normalized = String(value || children || "").toLowerCase();
  const isStatus = variant === "status";
  const isRole = variant === "role";
  const Icon = isStatus ? (["approved", "completed", "processed"].includes(normalized) ? CheckCircle2 : normalized === "pending" ? Clock : XCircle) : isRole ? Shield : Sparkles;
  const style = isStatus
    ? statusStyles[normalized] || "bg-bg-secondary text-text-muted border-border"
    : isRole
      ? roleStyles[normalized] || "bg-bg-secondary text-text-muted border-border"
      : "bg-cyan/10 text-cyan border-cyan/25";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${style}`}>
      <Icon size={12} />
      {children || value}
    </span>
  );
}

export default Badge;
