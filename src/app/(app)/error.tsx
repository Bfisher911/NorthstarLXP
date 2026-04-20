"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Compass, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for every authenticated surface. Keeps the shell
 * up while presenting a calm, branded "something went off-course" state with
 * a real reset button. Server component errors fall back to this without
 * the whole app crashing.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // In production this is where Sentry / Datadog / LogRocket would capture
    // the error along with the digest ID for server-side correlation.
    console.error("[northstar:route-error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-rose-600">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Something knocked this page off-course
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        We&rsquo;ve logged the issue. You can try again or navigate somewhere
        else — nothing you&rsquo;ve done was lost.
      </p>
      {error.digest && (
        <div className="mt-3 rounded-md border bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
          ref: {error.digest}
        </div>
      )}
      <div className="mt-8 flex items-center gap-2">
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4" /> Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">
            <Compass className="h-4 w-4" /> Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
