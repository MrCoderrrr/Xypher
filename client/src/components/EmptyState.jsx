import Button from "./Button";

function EmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-md border border-dashed border-border bg-bg-card/70 p-8 text-center">
      {Icon && (
        <div className="mb-4 rounded-full border border-cyan/25 bg-cyan/10 p-4 text-cyan">
          <Icon size={30} />
        </div>
      )}
      <h3 className="font-heading text-xl font-semibold text-text-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">{message}</p>
      {actionLabel && <Button className="mt-5" onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}

export default EmptyState;
