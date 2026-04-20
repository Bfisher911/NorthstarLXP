"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sticky-bottom selection toolbar. Slides in from below when `count > 0`.
 * Put the action buttons (Assign, Nudge, Delete…) as children.
 */
export function BulkToolbar({
  count,
  label = "selected",
  onClear,
  children,
  className,
}: {
  count: number;
  label?: string;
  onClear?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  const visible = count > 0;
  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-4 z-50 mx-auto flex justify-center transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-3 rounded-full border bg-popover/95 px-4 py-2 text-sm shadow-xl backdrop-blur",
          "max-w-[calc(100vw-2rem)] flex-wrap justify-center"
        )}
      >
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
          aria-label="Clear selection"
        >
          <span>{count}</span>
          <span className="text-muted-foreground/80">{label}</span>
          <X className="ml-1 h-3 w-3 opacity-70" />
        </button>
        <div className="h-6 w-px bg-border" />
        <div className="flex items-center gap-1.5">{children}</div>
      </div>
    </div>
  );
}
