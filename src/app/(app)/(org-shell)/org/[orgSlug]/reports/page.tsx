import { notFound } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  Flame,
  Link2,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/shell/kpi-card";
import { ExportCsvButton } from "@/components/reports/export-csv-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendArea } from "@/components/charts/area-chart";
import { ComplianceBar } from "@/components/charts/compliance-bar";
import { CompletionHeatmap } from "@/components/charts/completion-heatmap";
import { CompletionFunnel } from "@/components/charts/completion-funnel";
import { dashboardShares, getOrgBySlug, getWorkspacesForOrg } from "@/lib/data";
import { formatPct } from "@/lib/utils";

const trendData = [
  { label: "Wk 1", value: 62 },
  { label: "Wk 2", value: 66 },
  { label: "Wk 3", value: 71 },
  { label: "Wk 4", value: 74 },
  { label: "Wk 5", value: 78 },
  { label: "Wk 6", value: 82 },
  { label: "Wk 7", value: 84 },
  { label: "Wk 8", value: 88 },
];

// 14 weeks × 7 days = 98 points of synthesized daily completion counts. Higher
// activity mid-week, light weekends, trending up over time — feels real.
const heatmapValues = Array.from({ length: 98 }, (_, i) => {
  const dayOfWeek = i % 7;
  const weekIndex = Math.floor(i / 7);
  const weekday = dayOfWeek < 5 ? 14 : 3;
  const trend = weekIndex * 1.2;
  const noise = ((i * 2647) % 9) - 3;
  return Math.max(0, Math.round(weekday + trend + noise));
});

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspacesForOrg(org.id);
  const shares = dashboardShares.filter((s) => s.orgId === org.id);

  const byWorkspace = ws.map((w) => ({
    label: w.name.length > 18 ? w.name.slice(0, 16) + "…" : w.name,
    complete: Math.round(w.complianceHealth * 100),
    overdue: Math.max(0, 100 - Math.round(w.complianceHealth * 100) - 5),
  }));

  // Funnel: assigned → started → in-progress → completed
  const funnelStages = [
    { label: "Assigned", value: 4820, tone: "primary" as const },
    { label: "Started", value: 4217, tone: "sky" as const },
    { label: "In progress", value: 3612, tone: "violet" as const },
    { label: "Completed", value: 3198, tone: "emerald" as const },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Reports</span>}
        title="Organizational analytics"
        description="Filter by department, title, location, manager, status, workspace, and timeframe. Export or share a dashboard link."
        actions={
          <>
            <ExportCsvButton
              filename={`${orgSlug}-workspace-compliance`}
              rows={byWorkspace.map((w) => ({
                workspace: w.label,
                completed_pct: w.complete,
                overdue_pct: w.overdue,
              }))}
              columns={[
                { key: "workspace", label: "Workspace" },
                { key: "completed_pct", label: "Completed %" },
                { key: "overdue_pct", label: "Overdue %" },
              ]}
            />
            <Button><Share2 className="h-4 w-4" /> Share dashboard</Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active learners" value={org.activeLearners.toLocaleString()} icon={Users} accent="sky" />
        <KpiCard label="Completions (30d)" value="2,842" icon={CheckCircle2} accent="emerald" delta={12} />
        <KpiCard label="Overdue assignments" value="184" icon={Flame} accent="rose" delta={-7} />
        <KpiCard label="Compliance health" value={formatPct(org.complianceHealth)} icon={TrendingUp} accent="violet" delta={5} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Completion trend</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Weekly completion rate across every workspace.</p>
            </div>
            <Badge variant="success">+26 pts vs wk 1</Badge>
          </CardHeader>
          <CardContent>
            <TrendArea data={trendData} height={220} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Shared dashboards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {shares.map((s) => (
              <div key={s.id} className="rounded-lg border p-3">
                <div className="text-sm font-medium">{s.title}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {s.passwordProtected ? "Password protected · " : ""}
                  {s.url}
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">New shared dashboard</Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily completion activity</CardTitle>
            <p className="text-sm text-muted-foreground">Last 14 weeks across every workspace in {org.name}.</p>
          </CardHeader>
          <CardContent>
            <CompletionHeatmap values={heatmapValues} weeks={14} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assignment funnel</CardTitle>
            <p className="text-sm text-muted-foreground">Where learners drop off between assigned and completed.</p>
          </CardHeader>
          <CardContent>
            <CompletionFunnel stages={funnelStages} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace compliance (stacked)</CardTitle>
          <p className="text-sm text-muted-foreground">Completed vs overdue, per workspace.</p>
        </CardHeader>
        <CardContent>
          <ComplianceBar data={byWorkspace} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Saved filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {["Campus = Riverside", "Department contains Critical", "Hire date ≤ 90 days", "Worker type = full_time", "Course = HIPAA Privacy"].map((f) => (
            <Badge key={f} variant="outline" className="px-3 py-1.5">{f}</Badge>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
