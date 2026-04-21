import { notFound } from "next/navigation";
import { BarChart3, Download } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/shell/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MiniTrend } from "@/components/charts/mini-trend";
import { ComplianceBar } from "@/components/charts/compliance-bar";
import { getCoursesForWorkspace, getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";
import { formatPct } from "@/lib/utils";

const trend = [
  { label: "Wk 1", value: 58 },
  { label: "Wk 2", value: 62 },
  { label: "Wk 3", value: 66 },
  { label: "Wk 4", value: 71 },
  { label: "Wk 5", value: 74 },
  { label: "Wk 6", value: 78 },
  { label: "Wk 7", value: 82 },
  { label: "Wk 8", value: 85 },
];

export default async function WsReports({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const courses = getCoursesForWorkspace(ws.id);

  const perCourse = courses.slice(0, 6).map((c, i) => ({
    label: c.title.length > 14 ? c.title.slice(0, 14) + "…" : c.title,
    complete: 60 + ((i * 7) % 32),
    overdue: 6 + ((i * 3) % 10),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Reports</span>}
        title={`${ws.name} · Analytics`}
        description="Filter by course, department, title, location, manager, and timeframe."
        actions={<Button variant="outline"><Download className="h-4 w-4" /> Export CSV</Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Active assignments" value={ws.activeAssignments.toLocaleString()} />
        <KpiCard label="Health" value={formatPct(ws.complianceHealth)} />
        <KpiCard label="Courses" value={ws.courseCount} />
        <KpiCard label="Paths" value={ws.pathCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion trend</CardTitle>
        </CardHeader>
        <CardContent>
          <MiniTrend data={trend} height={180} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Per-course compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <ComplianceBar data={perCourse} />
        </CardContent>
      </Card>
    </div>
  );
}
