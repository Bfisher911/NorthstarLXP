import * as React from "react";
import { cn } from "@/lib/utils";

export interface FunnelStage {
  label: string;
  value: number;
  tone?: "primary" | "emerald" | "amber" | "rose" | "sky" | "violet";
}

const toneMap: Record<NonNullable<FunnelStage["tone"]>, string> = {
  primary: "from-northstar-600 to-northstar-400",
  emerald: "from-emerald-600 to-emerald-400",
  amber: "from-amber-600 to-amber-400",
  rose: "from-rose-600 to-rose-400",
  sky: "from-sky-600 to-sky-400",
  violet: "from-violet-600 to-violet-400",
};

/**
 * Trapezoidal funnel. Each stage is a horizontally-centered bar whose width
 * scales with its value relative to the top of the funnel. Drop-off vs the
 * previous stage is shown inline. Rendered purely as styled divs so it
 * respects theme tokens and stays crisp.
 */
export function CompletionFunnel({ stages, className }: { stages: FunnelStage[]; className?: string }) {
  const max = Math.max(1, ...stages.map((s) => s.value));
  return (
    <div className={cn("space-y-3", className)}>
      {stages.map((s, i) => {
        const pct = (s.value / max) * 100;
        const prev = i > 0 ? stages[i - 1].value : s.value;
        const dropPct = prev === 0 ? 0 : Math.round(((prev - s.value) / prev) * 100);
        const sharePct = stages[0].value === 0 ? 0 : Math.round((s.value / stages[0].value) * 100);
        const tone = s.tone ?? "primary";
        return (
          <div key={s.label} className="relative">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">{s.label}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {s.value.toLocaleString()}
                <span className="ml-2 font-semibold text-foreground">{sharePct}%</span>
              </span>
            </div>
            <div className="h-8 w-full overflow-hidden rounded-md bg-muted/40 ring-1 ring-inset ring-border/50">
              <div
                className={cn(
                  "relative mx-auto h-full rounded-md bg-gradient-to-r shadow-sm transition-[width] duration-700",
                  toneMap[tone]
                )}
                style={{ width: `${pct}%` }}
              >
                <div className="absolute inset-y-0 right-2 flex items-center text-[10px] font-semibold uppercase tracking-wider text-white/90">
                  {s.value > 0 && pct > 8 && `${sharePct}%`}
                </div>
              </div>
            </div>
            {i > 0 && dropPct > 0 && (
              <div className="mt-1 text-[10px] uppercase tracking-widest text-rose-500 dark:text-rose-400">
                −{dropPct}% drop-off from {stages[i - 1].label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
