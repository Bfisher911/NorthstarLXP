import { notFound } from "next/navigation";
import {
  BarChart3,
  CheckCircle2,
  Download,
  Flame,
  Link2,
  Share2,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/shell/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MiniTrend } from "@/components/charts/mini-trend";
import { ComplianceBar } from "@/components/charts/compliance-bar";
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
    label: w.name.replace(/(^|\s).*? /, (s) => s.length > 14 ? s : s).slice(0, 14),
    complete: Math.round(w.complianceHealth * 100),
    overdue: Math.max(0, 100 - Math.round(w.complianceHealth * 100) - 5),
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Reports</span>}
        title="Organizational analytics"
        description="Filter by department, title, location, manager, status, workspace, and timeframe. Export or share a dashboard link."
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" /> Export CSV</Button>
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
          <CardHeader>
            <CardTitle>Completion trend</CardTitle>
          </CardHeader>
          <CardContent>
            <MiniTrend data={trendData} height={200} />
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
