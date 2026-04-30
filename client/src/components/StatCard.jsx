function StatCard({ icon: Icon, label, value, trend }) {
  const positive = !trend || !String(trend).startsWith("-");
  return (
    <div className="rounded-xl border border-border bg-bg-card p-5 shadow-card transition hover:scale-[1.02] hover:border-accent">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-2 font-heading text-2xl font-bold text-text-primary">{value}</p>
        </div>
        {Icon && (
          <span className="rounded-md border border-cyan/25 bg-cyan/10 p-3 text-cyan">
            <Icon size={20} />
          </span>
        )}
      </div>
      {trend && <p className={`mt-4 text-xs font-semibold ${positive ? "text-success" : "text-danger"}`}>{trend} this period</p>}
    </div>
  );
}

export default StatCard;
