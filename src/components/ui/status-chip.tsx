import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Clock,
  Hourglass,
  Lock,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AssignmentStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "overdue"
  | "expiring"
  | "expired"
  | "locked"
  | "available";

const map: Record<AssignmentStatus, { label: string; icon: React.ComponentType<{ className?: string }>; tone: string }> = {
  not_started: {
    label: "Not started",
    icon: Circle,
    tone: "bg-muted text-muted-foreground border-transparent",
  },
  available: {
    label: "Ready",
    icon: PlayCircle,
    tone: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-transparent",
  },
  in_progress: {
    label: "In progress",
    icon: Hourglass,
    tone: "bg-primary/15 text-primary border-transparent",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-transparent",
  },
  overdue: {
    label: "Overdue",
    icon: AlertTriangle,
    tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-transparent",
  },
  expiring: {
    label: "Expiring",
    icon: Clock,
    tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-transparent",
  },
  expired: {
    label: "Expired",
    icon: AlertTriangle,
    tone: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-transparent",
  },
  locked: {
    label: "Locked",
    icon: Lock,
    tone: "bg-muted text-muted-foreground/70 border-transparent",
  },
};

/**
 * Canonical pill for any assignment / journey-node status. Used to keep
 * status language consistent across learner, manager, and admin views.
 */
export function StatusChip({
  status,
  size = "sm",
  className,
  labelOverride,
}: {
  status: AssignmentStatus;
  size?: "sm" | "md";
  className?: string;
  labelOverride?: string;
}) {
  const m = map[status];
  const Icon = m.icon;
  const sizes =
    size === "md"
      ? "text-xs px-2.5 py-1 [&_svg]:h-3.5 [&_svg]:w-3.5"
      : "text-[11px] px-2 py-0.5 [&_svg]:h-3 [&_svg]:w-3";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium",
        m.tone,
        sizes,
        className
      )}
    >
      <Icon /> {labelOverride ?? m.label}
    </span>
  );
}
