"use client";

import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedNumber } from "@/components/ui/animated-number";

/**
 * Small streak card shown on the learner home. Renders 7 recent days as a
 * sparkline of filled/empty nodes. Data is derived from a seeded-looking
 * pattern so it feels real without needing a live activity log.
 */
export function StreakCard({
  streakDays,
  recent,
}: {
  streakDays: number;
  recent: boolean[];
}) {
  const days = recent.slice(-7);
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-gradient-to-br from-amber-500/10 via-background to-background p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/30">
        <Flame className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight">
            <AnimatedNumber value={streakDays} />
          </span>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            day streak
          </span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          {days.map((active, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "h-5 w-5 rounded-full transition-all",
                  active
                    ? "bg-gradient-to-br from-amber-400 to-rose-500 shadow shadow-amber-500/40"
                    : "bg-muted ring-1 ring-border"
                )}
              />
              <span className="text-[9px] text-muted-foreground">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
