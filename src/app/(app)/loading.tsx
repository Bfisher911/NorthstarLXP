/**
 * Default Suspense fallback for any route in the authenticated shell. Uses
 * the shimmer `.skeleton` utility from globals.css so loading feels alive
 * rather than blank.
 */
export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-8 w-72" />
          <div className="skeleton h-3 w-96" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-9 w-24" />
          <div className="skeleton h-9 w-28" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card p-5">
            <div className="skeleton mb-3 h-3 w-20" />
            <div className="skeleton mb-1 h-7 w-24" />
            <div className="skeleton h-3 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="skeleton h-64 lg:col-span-2" />
        <div className="skeleton h-64" />
      </div>
    </div>
  );
}
