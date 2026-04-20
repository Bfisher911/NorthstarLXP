import * as React from "react";
import { cn } from "@/lib/utils";

interface StatRingProps {
  /** 0-1 */
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
  tone?: "primary" | "emerald" | "rose" | "amber" | "violet" | "sky";
  className?: string;
}

const toneMap: Record<NonNullable<StatRingProps["tone"]>, { track: string; fill: string; text: string }> = {
  primary: { track: "stroke-primary/15", fill: "stroke-primary", text: "text-primary" },
  emerald: { track: "stroke-emerald-500/15", fill: "stroke-emerald-500", text: "text-emerald-600" },
  rose: { track: "stroke-rose-500/15", fill: "stroke-rose-500", text: "text-rose-600" },
  amber: { track: "stroke-amber-500/15", fill: "stroke-amber-500", text: "text-amber-600" },
  violet: { track: "stroke-violet-500/15", fill: "stroke-violet-500", text: "text-violet-600" },
  sky: { track: "stroke-sky-500/15", fill: "stroke-sky-500", text: "text-sky-600" },
};

/**
 * A circular progress ring. Value is 0-1. Rendered server-side (no motion)
 * but smooth-looking thanks to linear-capped strokes and a muted track.
 */
export function StatRing({
  value,
  size = 120,
  stroke = 10,
  label,
  sublabel,
  tone = "primary",
  className,
}: StatRingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const t = toneMap[tone];
  const pct = Math.round(clamped * 100);

  return (
    <div className={cn("relative inline-flex flex-col items-center", className)} style={{ width: size }}>
      <svg width={size} height={size} className="ring-progress">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className={cn(t.track)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(t.fill, "transition-[stroke-dashoffset] duration-700")}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <div className={cn("font-display text-2xl font-semibold leading-none tracking-tight", t.text)}>
          {label ?? `${pct}%`}
        </div>
        {sublabel && (
          <div className="mt-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
