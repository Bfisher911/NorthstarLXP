import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Flame,
  Hourglass,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/shell/kpi-card";
import { MiniTrend } from "@/components/charts/mini-trend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  aiSuggestions,
  assignments,
  getCoursesForOrg,
  getOrgBySlug,
  getPathsForOrg,
  getUserById,
  getWorkspacesForOrg,
  users,
} from "@/lib/data";
import { formatPct } from "@/lib/utils";

const trendData = [
  { label: "Wk 1", value: 72 },
  { label: "Wk 2", value: 74 },
  { label: "Wk 3", value: 78 },
  { label: "Wk 4", value: 76 },
  { label: "Wk 5", value: 80 },
  { label: "Wk 6", value: 85 },
  { label: "Wk 7", value: 88 },
  { label: "Wk 8", value: 91 },
];

export default async function OrgOverviewPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspacesForOrg(org.id);
  const orgAssignments = assignments.filter((a) => {
    const user = getUserById(a.userId);
    return user?.orgId === org.id;
  });
  const overdue = orgAssignments.filter((a) => a.status === "overdue").length;
  const completedRate =
    orgAssignments.length === 0
      ? 0
      : orgAssignments.filter((a) => a.status === "completed").length / orgAssignments.length;
  const pending = aiSuggestions.filter((s) => s.orgId === org.id && s.status === "pending");
  const paths = getPathsForOrg(org.id);
  const catalog = getCoursesForOrg(org.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3 w-3" /> {org.name}
          </span>
        }
        title={`Welcome, ${org.name.split(" ")[0]}. Everything is tracking.`}
        description={`You have ${ws.length} workspaces, ${catalog.length} courses in the catalog, and ${paths.length} organizational learning paths.`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/org/${orgSlug}/reports`}>
                <BarChart3 className="h-4 w-4" /> Reports
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/org/${orgSlug}/paths/new`}>
                <Compass className="h-4 w-4" /> New org path
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Workspaces" value={ws.length} hint="Active departments" icon={Building2} accent="sky" />
        <KpiCard
          label="Active learners"
          value={users.filter((u) => u.orgId === org.id).length.toLocaleString()}
          hint={`${org.seats.toLocaleString()} seats`}
          icon={Users}
          accent="emerald"
        />
        <KpiCard
          label="Completion rate"
          value={formatPct(completedRate)}
          hint="Last 30 days"
          icon={CheckCircle2}
          accent="violet"
          delta={9}
        />
        <KpiCard
          label="Overdue"
          value={overdue}
          hint="Across the org"
          icon={Flame}
          accent="rose"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Organization completion</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Weekly completion rate across every workspace.</p>
            </div>
            <Badge variant="success">+19% vs last quarter</Badge>
          </CardHeader>
          <CardContent>
            <MiniTrend data={trendData} height={180} accent="#3d66ff" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-violet-500" /> AI review queue
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.slice(0, 4).map((s) => {
              const u = getUserById(s.userId);
              return (
                <div key={s.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{u?.name}</div>
                    <Badge variant="outline">{Math.round(s.confidence * 100)}%</Badge>
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.reason}</div>
                </div>
              );
            })}
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/workspaces`}>
                Review all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Workspaces</div>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Departments in your organization</h2>
          </div>
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/workspaces`}>Manage workspaces <ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ws.map((w) => (
            <Link
              key={w.id}
              href={`/org/${orgSlug}/w/${w.slug}`}
              className="group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-card/50 p-5 transition hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-northstar-500/20 to-northstar-500/5 text-2xl ring-1 ring-inset ring-northstar-500/20">
                  {w.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{w.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{w.department}</div>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{w.description}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t pt-3 text-center">
                <Stat label="Courses" value={w.courseCount} />
                <Stat label="Paths" value={w.pathCount} />
                <Stat label="Health" value={formatPct(w.complianceHealth)} />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {w.activeAssignments.toLocaleString()} assignments</span>
                <span className="text-primary group-hover:underline">Enter →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-4 w-4" /> Organizational learning paths
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/org/${orgSlug}/paths`}>See all →</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {paths.map((p) => (
              <Link
                key={p.id}
                href={`/org/${orgSlug}/paths/${p.id}`}
                className="group flex items-center gap-4 rounded-xl border p-3 transition hover:border-primary/60 hover:bg-accent/40"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-northstar-500/20 to-indigo-500/10 text-primary">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.assignedCount.toLocaleString()} assigned · {Math.round(p.completionRate * 100)}% complete
                  </div>
                </div>
                {p.required && <Badge variant="info">Required</Badge>}
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.href}
                href={`/org/${orgSlug}${a.href}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition hover:border-primary/50 hover:bg-accent/40"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 text-sm font-medium">{a.title}</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string | number; value: string | number }) {
  return (
    <div>
      <div className="font-display text-base font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}

const quickActions = [
  { title: "Create a course", href: "/catalog/new", icon: BookOpen },
  { title: "Build an org-wide path", href: "/paths/new", icon: Compass },
  { title: "Review AI suggestions", href: "/workspaces", icon: Brain },
  { title: "Run a completion report", href: "/reports", icon: BarChart3 },
  { title: "Check the audit log", href: "/audit", icon: Clock },
  { title: "See expiring credentials", href: "/compliance", icon: Hourglass },
];
