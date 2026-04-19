"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ComplianceBar({ data }: { data: Array<{ label: string; complete: number; overdue: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{ borderRadius: 10, fontSize: 12, border: "1px solid hsl(var(--border))" }}
          cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
        />
        <Bar dataKey="complete" stackId="a" fill="#3d66ff" radius={[6, 6, 0, 0]} />
        <Bar dataKey="overdue" stackId="a" fill="#f43f5e" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
