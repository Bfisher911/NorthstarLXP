"use client";

import * as React from "react";
import { useCountUp, useInView } from "@/lib/hooks";

export function AnimatedNumber({
  value,
  format,
  className,
  durationMs,
  prefix,
  suffix,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  durationMs?: number;
  prefix?: string;
  suffix?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>({ threshold: 0.1 });
  const current = useCountUp(inView ? value : 0, { durationMs });
  const rounded = Math.round(current);
  const shown = format ? format(rounded) : rounded.toLocaleString();
  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

export function AnimatedProgress({
  value,
  className,
  tone = "primary",
}: {
  value: number; // 0-100
  className?: string;
  tone?: "primary" | "emerald" | "rose" | "amber";
}) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });
  const width = useCountUp(inView ? value : 0, { durationMs: 900 });
  const toneMap: Record<string, string> = {
    primary: "from-northstar-500 to-northstar-300",
    emerald: "from-emerald-500 to-teal-400",
    rose: "from-rose-500 to-rose-400",
    amber: "from-amber-500 to-amber-400",
  };
  return (
    <div
      ref={ref}
      className={`h-2 w-full overflow-hidden rounded-full bg-muted ${className ?? ""}`}
    >
      <div
        className={`h-full rounded-full bg-gradient-to-r ${toneMap[tone]}`}
        style={{ width: `${Math.max(0, Math.min(100, width))}%`, transition: "width 50ms linear" }}
      />
    </div>
  );
}
