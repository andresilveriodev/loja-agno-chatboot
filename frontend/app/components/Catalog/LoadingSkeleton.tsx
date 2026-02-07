export function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col overflow-hidden rounded-xl border border-primary-200 bg-white"
        >
          <div className="aspect-[4/3] w-full animate-pulse bg-primary-100" />
          <div className="flex flex-1 flex-col p-4">
            <div className="h-5 w-3/4 animate-pulse rounded bg-primary-100" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-primary-100" />
            <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-primary-100" />
            <div className="mt-4 h-8 w-1/3 animate-pulse rounded bg-primary-100" />
            <div className="mt-3 h-10 w-full animate-pulse rounded bg-primary-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
