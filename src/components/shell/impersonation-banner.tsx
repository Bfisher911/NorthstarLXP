"use client";

import * as React from "react";
import { Eye, LogOut } from "lucide-react";
import { stopImpersonation } from "@/app/actions/session";
import { Button } from "@/components/ui/button";

/**
 * Full-width bar shown whenever the viewer is impersonating another user.
 * Keeps the warning *visible at all times* rather than tucked behind a chip,
 * tracks elapsed time, and provides a one-click return to the original
 * session.
 */
export function ImpersonationBanner() {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const label =
    mins > 0 ? `${mins}m ${secs.toString().padStart(2, "0")}s` : `${secs}s`;

  return (
    <div className="flex items-center gap-3 border-b border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 px-6 py-2 text-sm">
      <div className="relative flex h-6 w-6 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 animate-ping rounded-full bg-amber-500/40"
        />
        <Eye className="relative h-4 w-4 text-amber-600 dark:text-amber-300" />
      </div>
      <span className="font-medium text-amber-700 dark:text-amber-200">
        You&rsquo;re impersonating another user
      </span>
      <span className="text-xs text-amber-700/80 dark:text-amber-200/80">
        Elapsed: <span className="font-mono font-semibold tabular-nums">{label}</span>
      </span>
      <span className="hidden text-xs text-amber-700/70 dark:text-amber-200/70 sm:inline">
        · All actions are logged to the audit trail under your original account
      </span>
      <form action={stopImpersonation} className="ml-auto">
        <Button
          size="sm"
          variant="outline"
          className="border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-200"
        >
          <LogOut className="h-3.5 w-3.5" /> Exit impersonation
        </Button>
      </form>
    </div>
  );
}
