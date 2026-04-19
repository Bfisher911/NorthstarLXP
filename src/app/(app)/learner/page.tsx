import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Clock,
  Compass,
  Flame,
  Hourglass,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/shell/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JourneyMap } from "@/components/path/journey-map";
import { requireSession } from "@/lib/auth";
import {
  getAssignmentsForUser,
  getCourseById,
  getCertificatesForUser,
  getPathById,
} from "@/lib/data";
import { formatDate, relativeDate } from "@/lib/utils";
import { buildJourneyStatuses } from "@/lib/journey";

export default async function LearnerDashboard() {
  const { user } = await requireSession();
  const assignments = getAssignmentsForUser(user.id);
  const path = getPathById("lp_new_hire_clinical")!;
  const statuses = buildJourneyStatuses(path, assignments);
  const certs = getCertificatesForUser(user.id);

  const due = assignments.filter((a) => a.status !== "completed").sort((a, b) => {
    const da = a.dueAt ? new Date(a.dueAt).getTime() : Infinity;
    const db = b.dueAt ? new Date(b.dueAt).getTime() : Infinity;
    return da - db;
  });

  const completed = assignments.filter((a) => a.status === "completed");
  const overdue = assignments.filter((a) => a.status === "overdue");
  const totalProgress =
    assignments.length === 0
      ? 0
      : Math.round(
          (assignments.reduce((s, a) => s + a.progress, 0) / assignments.length) * 100
        );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Welcome back
          </span>
        }
        title={`Hi ${user.name.split(" ")[0]} — your journey is 68% complete`}
        description="Your required Clinical New Hire Journey is mapped out below. Start where you left off, or explore optional development."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/learner/training">View all training</Link>
            </Button>
            <Button asChild>
              <Link href="/learner/journey">
                <Compass className="h-4 w-4" /> Open journey
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Overall progress"
          value={`${totalProgress}%`}
          hint={`${completed.length} of ${assignments.length} completed`}
          icon={TrendingUp}
          accent="emerald"
        />
        <KpiCard
          label="Due this week"
          value={due.filter((d) => d.dueAt && new Date(d.dueAt).getTime() - Date.now() < 7 * 24 * 3600 * 1000).length}
          hint="Upcoming assignments"
          icon={Clock}
          accent="sky"
        />
        <KpiCard
          label="Overdue"
          value={overdue.length}
          hint="Finish these first"
          icon={Flame}
          accent="rose"
        />
        <KpiCard
          label="Active credentials"
          value={certs.filter((c) => c.status !== "expired").length}
          hint={`${certs.filter((c) => c.status === "expiring").length} expiring soon`}
          icon={Award}
          accent="amber"
        />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Required learning
            </div>
            <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">
              {path.name}
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{path.summary}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="success">On track</Badge>
            <Button variant="outline" asChild>
              <Link href="/learner/journey">
                Expand map <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
        <JourneyMap
          path={path}
          statuses={statuses}
          courseLinkPrefix="/learner/course"
          height={460}
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Up next</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/learner/training">See all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {due.slice(0, 4).map((a) => {
              const course = a.courseId ? getCourseById(a.courseId) : null;
              if (!course) return null;
              const dueLabel = a.dueAt
                ? a.status === "overdue"
                  ? `Overdue · was due ${formatDate(a.dueAt)}`
                  : `Due ${relativeDate(a.dueAt)}`
                : "Self-paced";
              return (
                <Link
                  key={a.id}
                  href={`/learner/course/${course.id}`}
                  className="group flex items-center gap-4 rounded-xl border p-3 transition hover:border-primary/60 hover:bg-accent/40"
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${course.thumbnailColor} text-2xl shadow-sm`}
                  >
                    {course.thumbnailEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{course.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {course.category}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {course.durationMinutes} min · {dueLabel}
                    </div>
                    <Progress value={a.progress * 100} className="mt-2 h-1.5" />
                  </div>
                  <div className="text-right">
                    {a.status === "overdue" ? (
                      <Badge variant="destructive">Overdue</Badge>
                    ) : a.status === "in_progress" ? (
                      <Badge variant="info">In progress</Badge>
                    ) : (
                      <Badge variant="outline">Start</Badge>
                    )}
                    <div className="mt-2 text-right opacity-0 transition group-hover:opacity-100">
                      <ArrowRight className="inline h-4 w-4 text-primary" />
                    </div>
                  </div>
                </Link>
              );
            })}
            {due.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                You're all caught up. Explore optional development →
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Credentials & expirations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certs.map((c) => {
              const course = c.courseId ? getCourseById(c.courseId) : null;
              return (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-br from-constellation-gold/40 to-amber-500/30 text-amber-600">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{course?.title ?? "Credential"}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.credentialCode} · {c.expiresAt ? `Expires ${formatDate(c.expiresAt)}` : "No expiration"}
                    </div>
                  </div>
                  {c.status === "expiring" ? (
                    <Badge variant="warning" className="gap-1">
                      <Hourglass className="h-3 w-3" /> Expiring
                    </Badge>
                  ) : c.status === "expired" ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>
              );
            })}
            {certs.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                Your first certificate will appear here when you complete a credential path.
              </div>
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/learner/certificates">
                View all credentials <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
        <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold">Build your own optional development path</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Save courses and live sessions that interest you — Northstar will thread them into a personal journey.
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/learner/development">
              Browse development <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
