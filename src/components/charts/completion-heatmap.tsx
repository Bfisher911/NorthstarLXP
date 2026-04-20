import * as React from "react";
import { cn } from "@/lib/utils";

interface HeatmapProps {
  /** Array of integers, one per day. Most-recent day is last. */
  values: number[];
  /** Tooltip label formatter; index 0 = oldest day. */
  labelFor?: (dayIndex: number, value: number) => string;
  /** Number of weeks (columns). Defaults to 14. */
  weeks?: number;
  className?: string;
}

/**
 * GitHub-style contribution heatmap. 7 rows (days of week) × N columns
 * (weeks). Values are bucketed into 5 intensity levels so the color scale
 * reads at a glance.
 */
export function CompletionHeatmap({ values, labelFor, weeks = 14, className }: HeatmapProps) {
  const days = weeks * 7;
  const padded = values.slice(-days);
  const missing = days - padded.length;
  const filled = [...Array(Math.max(0, missing)).fill(0), ...padded];

  const max = Math.max(1, ...filled);
  const intensity = (v: number) => {
    if (v === 0) return 0;
    const ratio = v / max;
    if (ratio < 0.2) return 1;
    if (ratio < 0.45) return 2;
    if (ratio < 0.7) return 3;
    return 4;
  };

  const columns: number[][] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(filled.slice(w * 7, (w + 1) * 7));
  }

  const scale = [
    "bg-muted/50",
    "bg-northstar-500/20",
    "bg-northstar-500/45",
    "bg-northstar-500/70",
    "bg-northstar-500",
  ];

  const weekdayLabels = ["M", "", "W", "", "F", "", ""];

  return (
    <div className={cn("flex gap-1", className)}>
      <div className="flex flex-col justify-between pb-5 pr-1 text-[9px] text-muted-foreground">
        {weekdayLabels.map((l, i) => (
          <span key={i} className="h-3.5 leading-none">
            {l}
          </span>
        ))}
      </div>
      <div className="flex-1">
        <div className="flex gap-[3px]">
          {columns.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((v, di) => {
                const dayIndex = wi * 7 + di;
                const title = labelFor ? labelFor(dayIndex, v) : `${v} completions`;
                return (
                  <div
                    key={di}
                    title={title}
                    className={cn(
                      "h-3.5 w-3.5 rounded-sm ring-1 ring-inset ring-border/50 transition-transform hover:scale-125",
                      scale[intensity(v)]
                    )}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {scale.map((c, i) => (
            <span key={i} className={cn("h-2.5 w-2.5 rounded-sm", c)} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
