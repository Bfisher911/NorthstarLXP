import * as React from "react";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  delta?: number;
  icon?: LucideIcon;
  accent?: "sky" | "emerald" | "amber" | "rose" | "violet" | "cyan" | "indigo";
}

const accentMap: Record<NonNullable<KpiCardProps["accent"]>, string> = {
  sky: "from-sky-500/20 to-sky-500/0 text-sky-600",
  emerald: "from-emerald-500/20 to-emerald-500/0 text-emerald-600",
  amber: "from-amber-500/20 to-amber-500/0 text-amber-600",
  rose: "from-rose-500/20 to-rose-500/0 text-rose-600",
  violet: "from-violet-500/20 to-violet-500/0 text-violet-600",
  cyan: "from-cyan-500/20 to-cyan-500/0 text-cyan-600",
  indigo: "from-indigo-500/20 to-indigo-500/0 text-indigo-600",
};

export function KpiCard({ label, value, hint, delta, icon: Icon, accent = "sky" }: KpiCardProps) {
  const positive = delta !== undefined && delta >= 0;
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-5">
        <div
          className={cn(
            "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br blur-2xl",
            accentMap[accent]
          )}
        />
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium text-muted-foreground">{label}</div>
            <div className="mt-1.5 font-display text-2xl font-semibold tracking-tight">{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                accentMap[accent].replace("from-", "bg-").split(" ")[0].replace("/20", "/15"),
                accentMap[accent].split(" ").find((c) => c.startsWith("text-"))
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        {delta !== undefined && (
          <div className="mt-3 flex items-center gap-1 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                positive
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
              )}
            >
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {positive ? "+" : ""}
              {delta}%
            </span>
            <span className="text-muted-foreground">vs last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
