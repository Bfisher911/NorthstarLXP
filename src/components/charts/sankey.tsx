import * as React from "react";
import { cn } from "@/lib/utils";

export interface SankeyNode {
  id: string;
  label: string;
  column: number;
  color?: string;
}

export interface SankeyLink {
  from: string;
  to: string;
  value: number;
  color?: string;
}

/**
 * Minimal Sankey diagram rendered in SVG. Groups nodes into columns, sizes
 * each node by the total flow through it, and draws smooth cubic-bezier
 * ribbons between them. Good enough for survey-trigger / assignment-source
 * visualizations without a full d3-sankey dependency.
 */
export function Sankey({
  nodes,
  links,
  width = 700,
  height = 340,
  className,
}: {
  nodes: SankeyNode[];
  links: SankeyLink[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const columns = Array.from(new Set(nodes.map((n) => n.column))).sort((a, b) => a - b);

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const inByNode = new Map<string, number>();
  const outByNode = new Map<string, number>();
  for (const l of links) {
    inByNode.set(l.to, (inByNode.get(l.to) ?? 0) + l.value);
    outByNode.set(l.from, (outByNode.get(l.from) ?? 0) + l.value);
  }
  const sizeOf = (id: string) => Math.max(inByNode.get(id) ?? 0, outByNode.get(id) ?? 0);

  const pad = 16;
  const colWidth = (width - pad * 2) / Math.max(1, columns.length - 1);
  const nodeWidth = 14;
  const innerHeight = height - pad * 2;

  type Laid = {
    id: string;
    label: string;
    x: number;
    y: number;
    h: number;
    color: string;
  };
  const laid: Laid[] = [];
  for (const col of columns) {
    const nodesInCol = nodes.filter((n) => n.column === col);
    const totalValue = nodesInCol.reduce((s, n) => s + sizeOf(n.id), 0) || 1;
    const gap = Math.min(20, innerHeight / Math.max(1, nodesInCol.length + 1));
    const availableH = innerHeight - gap * (nodesInCol.length - 1);
    let yCursor = pad;
    for (const n of nodesInCol) {
      const share = sizeOf(n.id) / totalValue;
      const h = Math.max(14, share * availableH);
      laid.push({
        id: n.id,
        label: n.label,
        x: pad + col * colWidth,
        y: yCursor,
        h,
        color: n.color ?? "#3d66ff",
      });
      yCursor += h + gap;
    }
  }
  const laidById = new Map(laid.map((n) => [n.id, n]));

  // For each source node, stack outgoing link y-offsets; same for targets.
  const outOffset = new Map<string, number>();
  const inOffset = new Map<string, number>();

  const sortedLinks = [...links].sort((a, b) => {
    const ay = laidById.get(a.from)?.y ?? 0;
    const by = laidById.get(b.from)?.y ?? 0;
    return ay - by;
  });

  const ribbons: Array<{
    d: string;
    color: string;
    value: number;
    from: string;
    to: string;
    thickness: number;
  }> = [];

  for (const l of sortedLinks) {
    const src = laidById.get(l.from);
    const dst = laidById.get(l.to);
    if (!src || !dst) continue;
    const thickness = Math.max(2, (l.value / Math.max(1, Math.max(...links.map((x) => x.value)))) * Math.min(src.h, dst.h));
    const srcOff = outOffset.get(l.from) ?? 0;
    const dstOff = inOffset.get(l.to) ?? 0;
    const y1 = src.y + srcOff + thickness / 2;
    const y2 = dst.y + dstOff + thickness / 2;
    const x1 = src.x + nodeWidth;
    const x2 = dst.x;
    const mid = (x1 + x2) / 2;
    const d = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`;
    ribbons.push({
      d,
      color: l.color ?? src.color,
      value: l.value,
      from: src.label,
      to: dst.label,
      thickness,
    });
    outOffset.set(l.from, srcOff + thickness);
    inOffset.set(l.to, dstOff + thickness);
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("h-auto w-full", className)} role="img">
      <g>
        {ribbons.map((r, i) => (
          <path
            key={i}
            d={r.d}
            stroke={r.color}
            strokeWidth={r.thickness}
            strokeOpacity={0.35}
            fill="none"
          >
            <title>
              {r.from} → {r.to}: {r.value}
            </title>
          </path>
        ))}
      </g>
      <g>
        {laid.map((n) => (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={nodeWidth}
              height={n.h}
              rx={3}
              fill={n.color}
              fillOpacity={0.9}
            />
            <text
              x={nodeById.get(n.id)?.column === columns[columns.length - 1] ? n.x - 6 : n.x + nodeWidth + 6}
              y={n.y + n.h / 2 + 3}
              textAnchor={nodeById.get(n.id)?.column === columns[columns.length - 1] ? "end" : "start"}
              style={{ fontSize: 11, fontWeight: 500 }}
              className="fill-foreground"
            >
              {n.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
