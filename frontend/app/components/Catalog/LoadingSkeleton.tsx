export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-lm-md border border-black/6 bg-[var(--lm-surface)] shadow-lm-soft"
        >
          <div className="aspect-square w-full animate-pulse bg-[var(--lm-surface-alt)]" />
          <div className="flex flex-1 flex-col p-2">
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[var(--lm-surface-alt)]" />
            <div className="mt-2 h-3 w-full animate-pulse rounded bg-[var(--lm-surface-alt)]" />
            <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-[var(--lm-surface-alt)]" />
            <div className="mt-3 h-9 w-full animate-pulse rounded-full bg-[var(--lm-surface-alt)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
