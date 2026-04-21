import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  Flame,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { KpiCard } from "@/components/shell/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  aiSuggestions,
  getCoursesForWorkspace,
  getOrgBySlug,
  getPathsForWorkspace,
  getUserById,
  getWorkspaceBySlug,
} from "@/lib/data";
import { relativeDate } from "@/lib/utils";

export default async function WorkspaceDashboard({
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
  const paths = getPathsForWorkspace(ws.id);
  const pending = aiSuggestions.filter((s) => s.workspaceId === ws.id && s.status === "pending");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> {ws.emoji} {ws.name}
          </span>
        }
        title={ws.name}
        description={ws.description}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/org/${orgSlug}/w/${wsSlug}/reports`}>Reports</Link>
            </Button>
            <Button asChild>
              <Link href={`/org/${orgSlug}/w/${wsSlug}/courses/new`}>
                <Plus className="h-4 w-4" /> New course
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Courses" value={ws.courseCount} icon={BookOpen} accent="sky" />
        <KpiCard label="Learning paths" value={ws.pathCount} icon={Compass} accent="violet" />
        <KpiCard
          label="Active assignments"
          value={ws.activeAssignments.toLocaleString()}
          icon={Send}
          accent="emerald"
          delta={14}
        />
        <KpiCard
          label="AI suggestions"
          value={pending.length}
          hint="Awaiting review"
          icon={Brain}
          accent="indigo"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top courses</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/org/${orgSlug}/w/${wsSlug}/courses`}>View all →</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {courses.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href={`/org/${orgSlug}/w/${wsSlug}/courses/${c.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition hover:border-primary/60"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.thumbnailColor} text-lg`}>
                  {c.thumbnailEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{c.title}</span>
                    <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                    <Badge variant="outline" className="text-[10px] capitalize">{c.type.replace("_", " ")}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Updated {relativeDate(c.updatedAt)} · {c.durationMinutes} min
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-violet-500" /> AI assignment suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 && (
              <div className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                All clear — no suggestions waiting.
              </div>
            )}
            {pending.slice(0, 4).map((s) => {
              const u = getUserById(s.userId);
              return (
                <div key={s.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{u?.name}</div>
                    <Badge variant="outline">{Math.round(s.confidence * 100)}%</Badge>
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{s.reason}</div>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" className="h-7 px-2 text-xs">Approve</Button>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs">Reject</Button>
                  </div>
                </div>
              );
            })}
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/w/${wsSlug}/ai`}>
                Review queue <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Compass className="h-4 w-4" /> Learning paths in this workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {paths.length === 0 && (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No workspace-scoped paths yet. Build one in the path editor.
              </div>
            )}
            {paths.map((p) => (
              <Link
                key={p.id}
                href={`/org/${orgSlug}/w/${wsSlug}/paths/${p.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition hover:border-primary/60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-northstar-500/20 to-primary/10 text-primary">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {p.assignedCount} assigned · {Math.round(p.completionRate * 100)}% complete
                  </div>
                  <Progress value={p.completionRate * 100} className="mt-2 h-1.5" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck2 className="h-4 w-4" /> Survey-triggered work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border p-3">
              <div className="font-medium">Annual Safety Needs Assessment</div>
              <div className="mt-1 text-xs text-muted-foreground">
                "Do you lift &gt;50 lbs?" → Back Safety
              </div>
              <div className="text-xs text-muted-foreground">
                "Do you handle blood products?" → Bloodborne Pathogens
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="info">184 responses this week</Badge>
                <Badge variant="outline">12 triggered</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/w/${wsSlug}/surveys`}>Manage surveys →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <MiniStat icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} label="Completions · 30d" value="1,284" />
        <MiniStat icon={<Clock className="h-4 w-4 text-sky-500" />} label="Due this week" value="142" />
        <MiniStat icon={<Flame className="h-4 w-4 text-rose-500" />} label="Overdue" value="38" />
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">{icon}</div>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className="font-display text-xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}
