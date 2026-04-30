function PromptCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-bg-card">
      <div className="aspect-video skeleton" />
      <div className="space-y-4 p-5">
        <div className="h-4 w-24 rounded skeleton" />
        <div className="h-5 w-3/4 rounded skeleton" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded skeleton" />
          <div className="h-3 w-5/6 rounded skeleton" />
        </div>
        <div className="h-9 w-full rounded skeleton" />
      </div>
    </div>
  );
}

export default PromptCardSkeleton;
