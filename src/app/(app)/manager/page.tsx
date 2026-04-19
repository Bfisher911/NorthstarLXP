import Link from "next/link";
import {
  Award,
  BellRing,
  CheckCircle2,
  Clock,
  Flame,
  Hourglass,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/shell/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { requireSession } from "@/lib/auth";
import {
  assignments as allAssignments,
  certificates as allCerts,
  getCourseById,
  getDirectReports,
} from "@/lib/data";
import { formatDate, initials, relativeDate } from "@/lib/utils";

export default async function ManagerDashboard() {
  const { user } = await requireSession();
  const team = getDirectReports(user.id);
  const teamIds = new Set(team.map((u) => u.id));
  const teamAssignments = allAssignments.filter((a) => teamIds.has(a.userId));
  const teamCerts = allCerts.filter((c) => teamIds.has(c.userId));

  const overdue = teamAssignments.filter((a) => a.status === "overdue");
  const dueSoon = teamAssignments.filter((a) => {
    if (!a.dueAt || a.status === "completed") return false;
    const diff = new Date(a.dueAt).getTime() - Date.now();
    return diff > 0 && diff < 7 * 24 * 3600 * 1000;
  });
  const completedThisMonth = teamAssignments.filter(
    (a) =>
      a.completedAt && new Date(a.completedAt).getTime() > Date.now() - 30 * 24 * 3600 * 1000
  );
  const expiringCerts = teamCerts.filter((c) => c.status === "expiring" || c.status === "expired");

  const teamRows = team.map((u) => {
    const uAssignments = teamAssignments.filter((a) => a.userId === u.id);
    const completed = uAssignments.filter((a) => a.status === "completed").length;
    const total = uAssignments.length || 1;
    const uOverdue = uAssignments.filter((a) => a.status === "overdue").length;
    const progress = Math.round((completed / total) * 100);
    return { u, uAssignments, completed, total, uOverdue, progress };
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Team compliance
          </span>
        }
        title={`Team overview · ${team.length} direct reports`}
        description={`You're ${user.employee?.title ?? "manager"} for a team of ${team.length}. Track their learning and send reminders without leaving the page.`}
        actions={
          <Button>
            <BellRing className="h-4 w-4" /> Send team reminder
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Direct reports" value={team.length} hint="Active employees" icon={Users} accent="sky" />
        <KpiCard label="Overdue" value={overdue.length} hint="Across team" icon={Flame} accent="rose" />
        <KpiCard label="Due this week" value={dueSoon.length} hint="Upcoming deadlines" icon={Clock} accent="amber" />
        <KpiCard
          label="Completed · 30d"
          value={completedThisMonth.length}
          hint="Trending up"
          icon={CheckCircle2}
          accent="emerald"
          delta={18}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Team compliance</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/manager/team">See full team →</Link>
            </Button>
          </CardHeader>
          <CardContent className="divide-y">
            {teamRows.map(({ u, completed, total, uOverdue, progress }) => (
              <Link
                key={u.id}
                href={`/manager/team/${u.id}`}
                className="group -mx-2 flex items-center gap-4 rounded-lg px-2 py-3 transition hover:bg-accent/40"
              >
                <Avatar>
                  <AvatarFallback>{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold">{u.name}</span>
                    <span className="text-xs text-muted-foreground">· {u.employee?.title}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>
                      {completed}/{total} complete
                    </span>
                    {uOverdue > 0 && (
                      <Badge variant="destructive" className="text-[10px]">
                        {uOverdue} overdue
                      </Badge>
                    )}
                  </div>
                  <Progress value={progress} className="mt-2 h-1.5" />
                </div>
                <Button variant="ghost" size="sm">
                  Nudge
                </Button>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hourglass className="h-4 w-4 text-amber-500" /> Expiring credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {expiringCerts.length === 0 && (
              <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                Nothing expiring in the next 30 days. Great work.
              </div>
            )}
            {expiringCerts.map((c) => {
              const course = c.courseId ? getCourseById(c.courseId) : null;
              const learner = team.find((t) => t.id === c.userId);
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-amber-500/15 text-amber-600">
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{learner?.name}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {course?.title} · {c.status === "expired" ? "Expired" : "Expires"} {formatDate(c.expiresAt!)}
                    </div>
                  </div>
                  <Badge variant={c.status === "expired" ? "destructive" : "warning"}>
                    {c.status === "expired" ? "Expired" : "Expiring"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming deadlines</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {[...overdue, ...dueSoon].slice(0, 6).map((a) => {
            const learner = team.find((t) => t.id === a.userId);
            const course = a.courseId ? getCourseById(a.courseId) : null;
            if (!learner || !course) return null;
            return (
              <div key={a.id} className="flex items-center gap-4 py-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials(learner.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="text-sm">
                    <span className="font-semibold">{learner.name}</span>{" "}
                    <span className="text-muted-foreground">·</span>{" "}
                    <span>{course.title}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.status === "overdue"
                      ? `Overdue — was due ${formatDate(a.dueAt!)}`
                      : `Due ${relativeDate(a.dueAt!)}`}
                    {a.source && ` · ${a.source}`}
                  </div>
                </div>
                {a.status === "overdue" ? (
                  <Badge variant="destructive">Overdue</Badge>
                ) : (
                  <Badge variant="warning">Due soon</Badge>
                )}
                <Button variant="outline" size="sm">
                  <BellRing className="h-3.5 w-3.5" /> Remind
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
