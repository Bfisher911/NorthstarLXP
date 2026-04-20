"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  FileCheck2,
  Flag,
  Hourglass,
  MapPin,
  ShieldCheck,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/lib/hooks";
import type { LearningPath, PathNode, PathNodeKind } from "@/lib/types";

type NodeStatus = "locked" | "available" | "in_progress" | "completed" | "overdue" | "expiring";

export interface JourneyMapProps {
  path: LearningPath;
  statuses?: Record<string, NodeStatus>;
  /** When set, nodes with a courseId become links: `${courseLinkPrefix}/${courseId}`. */
  courseLinkPrefix?: string;
  legend?: boolean;
  height?: number | string;
  /** Enable click-to-focus: selecting a node dims non-ancestor/descendant nodes. */
  focusable?: boolean;
}

function linkForNode(node: PathNode, prefix?: string): string | undefined {
  if (!prefix || !node.courseId) return undefined;
  return `${prefix.replace(/\/$/, "")}/${node.courseId}`;
}

const kindIcon: Record<PathNodeKind, React.ComponentType<{ className?: string }>> = {
  course: BookOpen,
  live: Video,
  survey: FileCheck2,
  policy: ShieldCheck,
  checkpoint: Flag,
  credential: MapPin,
};

const statusColor: Record<NodeStatus, { ring: string; fill: string; text: string; halo: string }> = {
  completed: {
    ring: "stroke-emerald-500",
    fill: "fill-emerald-500",
    text: "text-emerald-600",
    halo: "fill-emerald-500/25",
  },
  in_progress: {
    ring: "stroke-northstar-500",
    fill: "fill-northstar-500",
    text: "text-northstar-600",
    halo: "fill-northstar-500/25",
  },
  available: {
    ring: "stroke-sky-500",
    fill: "fill-white dark:fill-slate-900",
    text: "text-sky-600",
    halo: "fill-sky-500/15",
  },
  overdue: {
    ring: "stroke-rose-500",
    fill: "fill-rose-500",
    text: "text-rose-600",
    halo: "fill-rose-500/30",
  },
  expiring: {
    ring: "stroke-amber-500",
    fill: "fill-amber-500",
    text: "text-amber-600",
    halo: "fill-amber-500/25",
  },
  locked: {
    ring: "stroke-slate-300 dark:stroke-slate-600",
    fill: "fill-slate-200 dark:fill-slate-700",
    text: "text-muted-foreground",
    halo: "fill-transparent",
  },
};

export function JourneyMap({
  path,
  statuses = {},
  courseLinkPrefix,
  legend = true,
  height = 420,
  focusable = true,
}: JourneyMapProps) {
  const width = 1000;
  const h = typeof height === "number" ? height : 420;
  const pad = 60;
  const reducedMotion = useReducedMotion();

  const toX = (x: number) => pad + (x / 100) * (width - pad * 2);
  const toY = (y: number) => pad + (y / 100) * (h - pad * 2);

  const nodeById = React.useMemo(() => {
    const m = new Map<string, PathNode>();
    for (const n of path.nodes) m.set(n.id, n);
    return m;
  }, [path.nodes]);

  const [hover, setHover] = React.useState<string | null>(null);
  const [selected, setSelected] = React.useState<string | null>(null);

  const active = selected ?? hover;
  const activeNode = active ? nodeById.get(active) : null;
  const activeStatus = activeNode ? statuses[activeNode.id] ?? "locked" : null;

  // Build adjacency for focus-mode ancestor / descendant traversal.
  const { ancestors, descendants } = React.useMemo(() => {
    const inc: Record<string, string[]> = {};
    const out: Record<string, string[]> = {};
    for (const e of path.edges) {
      (inc[e.to] ??= []).push(e.from);
      (out[e.from] ??= []).push(e.to);
    }
    return { ancestors: inc, descendants: out };
  }, [path.edges]);

  const focusSet = React.useMemo(() => {
    if (!selected) return null;
    const set = new Set<string>([selected]);
    const expand = (id: string, graph: Record<string, string[]>) => {
      const stack = [id];
      while (stack.length) {
        const cur = stack.pop()!;
        for (const next of graph[cur] ?? []) {
          if (!set.has(next)) {
            set.add(next);
            stack.push(next);
          }
        }
      }
    };
    expand(selected, ancestors);
    expand(selected, descendants);
    return set;
  }, [selected, ancestors, descendants]);

  const completedEdges = React.useMemo(
    () =>
      path.edges.filter((e) => {
        const s = statuses[e.from];
        return s === "completed";
      }),
    [path.edges, statuses]
  );

  return (
    <div className="relative">
      <div
        className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-background via-card/60 to-background"
        style={{ minHeight: h }}
      >
        <div aria-hidden className="absolute inset-0 bg-star-field opacity-60" />
        <div aria-hidden className="absolute inset-0 bg-grid opacity-30" />
        <svg
          viewBox={`0 0 ${width} ${h}`}
          className="relative z-10 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Learning journey: ${path.name}`}
        >
          <defs>
            <linearGradient id="edgeGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#3d66ff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="edgeDone" x1="0" x2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3d66ff" stopOpacity="0.8" />
            </linearGradient>
            <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {path.edges.map((edge) => {
            const from = nodeById.get(edge.from);
            const to = nodeById.get(edge.to);
            if (!from || !to) return null;
            const fromStatus = statuses[from.id] ?? "locked";
            const toStatus = statuses[to.id] ?? "locked";
            const done = fromStatus === "completed";
            const activeFlow =
              fromStatus === "completed" ||
              toStatus === "completed" ||
              toStatus === "in_progress";
            const x1 = toX(from.x);
            const y1 = toY(from.y);
            const x2 = toX(to.x);
            const y2 = toY(to.y);
            const midX = (x1 + x2) / 2;
            const pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
            const dimmed = focusSet && !(focusSet.has(from.id) && focusSet.has(to.id));
            return (
              <g
                key={edge.id}
                className="transition-opacity"
                style={{ opacity: dimmed ? 0.15 : 1 }}
              >
                <path
                  id={`edge-${path.id}-${edge.id}`}
                  d={pathD}
                  fill="none"
                  stroke={activeFlow ? "url(#edgeDone)" : "url(#edgeGrad)"}
                  strokeWidth={edge.alternate ? 1.8 : 2.4}
                  strokeDasharray={edge.alternate ? "6 6" : undefined}
                  strokeLinecap="round"
                  opacity={activeFlow ? 0.95 : 0.55}
                />
                {edge.label && (
                  <g>
                    <rect
                      x={midX - 64}
                      y={(y1 + y2) / 2 - 10}
                      width={128}
                      height={20}
                      rx={10}
                      className="fill-background"
                      opacity={0.92}
                    />
                    <text
                      x={midX}
                      y={(y1 + y2) / 2 + 4}
                      textAnchor="middle"
                      className="fill-muted-foreground"
                      style={{ fontSize: 10, fontWeight: 600 }}
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Comet trail along every completed edge — a glowing dot travels
              from completed source toward its next node so the learner can
              literally see their progress move through the journey. */}
          {!reducedMotion &&
            completedEdges.map((edge, i) => (
              <g key={`comet-${edge.id}`} opacity={focusSet ? 0.25 : 0.95}>
                <circle r={5} fill="#34d399" filter="url(#softGlow)">
                  <animateMotion
                    dur={`${3 + (i % 3) * 0.7}s`}
                    repeatCount="indefinite"
                    begin={`${(i * 0.4) % 2}s`}
                    rotate="auto"
                  >
                    <mpath xlinkHref={`#edge-${path.id}-${edge.id}`} />
                  </animateMotion>
                </circle>
                <circle r={2} fill="#ffffff">
                  <animateMotion
                    dur={`${3 + (i % 3) * 0.7}s`}
                    repeatCount="indefinite"
                    begin={`${(i * 0.4) % 2}s`}
                    rotate="auto"
                  >
                    <mpath xlinkHref={`#edge-${path.id}-${edge.id}`} />
                  </animateMotion>
                </circle>
              </g>
            ))}

          {path.nodes.map((node) => {
            const status: NodeStatus = statuses[node.id] ?? "locked";
            const colors = statusColor[status];
            const cx = toX(node.x);
            const cy = toY(node.y);
            const Icon = kindIcon[node.kind];
            const isActive = active === node.id;
            const r = node.kind === "credential" ? 28 : 22;
            const dimmed = focusSet ? !focusSet.has(node.id) : false;
            const content = (
              <g
                key={node.id}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHover(node.id)}
                onMouseLeave={() => setHover((h) => (h === node.id ? null : h))}
                onClick={() => {
                  if (focusable) {
                    setSelected((s) => (s === node.id ? null : node.id));
                  } else {
                    setSelected((s) => (s === node.id ? null : node.id));
                  }
                }}
                transform={isActive ? `translate(0, -3)` : undefined}
                style={{ opacity: dimmed ? 0.22 : 1 }}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={r + 16}
                  className={cn(colors.halo, status === "in_progress" && "animate-pulse-glow")}
                  filter={status === "in_progress" || status === "completed" ? "url(#softGlow)" : undefined}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  className={cn(
                    colors.ring,
                    status === "locked" ? "fill-slate-100 dark:fill-slate-800" : colors.fill
                  )}
                  strokeWidth={3}
                />
                <g transform={`translate(${cx - 9}, ${cy - 9})`}>
                  <foreignObject width={18} height={18}>
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px]",
                        status === "completed" || status === "overdue" || status === "in_progress" || status === "expiring"
                          ? "text-white"
                          : colors.text
                      )}
                    />
                  </foreignObject>
                </g>
                {node.kind === "credential" && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={r + 5}
                    className="stroke-constellation-gold fill-none"
                    strokeWidth={1.5}
                    strokeDasharray="3 4"
                  />
                )}
                <text
                  x={cx}
                  y={cy + r + 18}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ fontSize: 12, fontWeight: 600 }}
                >
                  {truncate(node.title, 28)}
                </text>
                {node.subtitle && (
                  <text
                    x={cx}
                    y={cy + r + 32}
                    textAnchor="middle"
                    className="fill-muted-foreground"
                    style={{ fontSize: 10 }}
                  >
                    {truncate(node.subtitle, 32)}
                  </text>
                )}
                {status === "overdue" && (
                  <g transform={`translate(${cx + r - 4}, ${cy - r - 6})`}>
                    <circle r={9} className="fill-rose-500" />
                    <text
                      x={0}
                      y={3}
                      textAnchor="middle"
                      className="fill-white"
                      style={{ fontSize: 10, fontWeight: 700 }}
                    >
                      !
                    </text>
                  </g>
                )}
                {status === "completed" && (
                  <g transform={`translate(${cx + r - 4}, ${cy - r - 6})`}>
                    <circle r={9} className="fill-white stroke-emerald-500" strokeWidth={2} />
                    <foreignObject x={-7} y={-7} width={14} height={14}>
                      <CheckCircle2 className="h-[14px] w-[14px] text-emerald-500" />
                    </foreignObject>
                  </g>
                )}
              </g>
            );
            return content;
          })}
        </svg>

        {activeNode && (
          <NodePopover
            node={activeNode}
            status={activeStatus!}
            href={linkForNode(activeNode, courseLinkPrefix)}
            onClose={() => setSelected(null)}
          />
        )}

        {selected && focusable && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute right-3 top-3 z-20 rounded-full border bg-background/80 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur transition hover:text-foreground"
          >
            Reset focus
          </button>
        )}
      </div>

      {legend && (
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <LegendDot color="bg-emerald-500" label="Completed" />
          <LegendDot color="bg-northstar-500" label="In progress" />
          <LegendDot color="bg-sky-500" label="Available" />
          <LegendDot color="bg-rose-500" label="Overdue" />
          <LegendDot color="bg-amber-500" label="Expiring" />
          <LegendDot color="bg-slate-300" label="Locked" />
          <span className="ml-auto hidden sm:inline">Tap a node to preview · click again to pin</span>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", color)} /> {label}
    </span>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function NodePopover({
  node,
  status,
  href,
  onClose,
}: {
  node: PathNode;
  status: NodeStatus;
  href?: string;
  onClose: () => void;
}) {
  const Icon = kindIcon[node.kind];
  const statusLabel: Record<NodeStatus, string> = {
    completed: "Completed",
    in_progress: "In progress",
    available: "Available to start",
    overdue: "Overdue",
    expiring: "Expiring soon",
    locked: "Locked — complete prerequisites",
  };
  return (
    <div className="absolute right-4 top-4 z-20 w-80 animate-fade-in rounded-xl border bg-background/95 p-4 shadow-xl backdrop-blur">
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {node.kind} · {node.required ? "Required" : "Optional"}
          </div>
          <div className="font-semibold">{node.title}</div>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-muted-foreground hover:text-foreground"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {node.subtitle && <p className="text-sm text-muted-foreground">{node.subtitle}</p>}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <StatusChip status={status} />
        {node.expiresMonths && (
          <span className="inline-flex items-center gap-1 rounded-full border bg-muted px-2 py-0.5 text-muted-foreground">
            <Hourglass className="h-3 w-3" /> Renews every {node.expiresMonths} mo
          </span>
        )}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">{statusLabel[status]}</div>
      {href && (status === "available" || status === "in_progress" || status === "overdue") && (
        <Link
          href={href}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          {status === "in_progress" ? "Continue" : status === "overdue" ? "Resume (overdue)" : "Start"}
        </Link>
      )}
      {href && status === "completed" && (
        <Link
          href={href}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium hover:bg-accent"
        >
          Review
        </Link>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: NodeStatus }) {
  const cfg: Record<NodeStatus, { label: string; cls: string; Icon: React.ComponentType<{ className?: string }> }> = {
    completed: { label: "Completed", cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", Icon: CheckCircle2 },
    in_progress: { label: "In progress", cls: "bg-northstar-500/10 text-northstar-700 dark:text-northstar-300", Icon: Clock },
    available: { label: "Available", cls: "bg-sky-500/10 text-sky-700 dark:text-sky-300", Icon: Circle },
    overdue: { label: "Overdue", cls: "bg-rose-500/10 text-rose-700 dark:text-rose-300", Icon: Clock },
    expiring: { label: "Expiring", cls: "bg-amber-500/10 text-amber-700 dark:text-amber-300", Icon: Hourglass },
    locked: { label: "Locked", cls: "bg-muted text-muted-foreground", Icon: Circle },
  };
  const c = cfg[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium", c.cls)}>
      <c.Icon className="h-3 w-3" /> {c.label}
    </span>
  );
}
