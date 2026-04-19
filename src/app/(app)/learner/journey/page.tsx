import Link from "next/link";
import { ArrowRight, CheckCircle2, Compass, Flag, Hourglass, Star } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JourneyMap } from "@/components/path/journey-map";
import { requireSession } from "@/lib/auth";
import { getAssignmentsForUser, getCourseById, getPathById } from "@/lib/data";
import { buildJourneyStatuses } from "@/lib/journey";
import { formatDate } from "@/lib/utils";

export default async function JourneyPage() {
  const { user } = await requireSession();
  const path = getPathById("lp_new_hire_clinical")!;
  const assignments = getAssignmentsForUser(user.id);
  const statuses = buildJourneyStatuses(path, assignments);

  const completed = path.nodes.filter((n) => statuses[n.id] === "completed").length;
  const percent = Math.round((completed / path.nodes.length) * 100);

  const rows = path.nodes
    .filter((n) => n.kind !== "checkpoint" && n.kind !== "credential")
    .map((n) => ({ node: n, status: statuses[n.id] }));

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-1">
            <Compass className="h-3 w-3" /> Learning journey
          </span>
        }
        title={path.name}
        description={path.summary}
        actions={
          <Badge variant="outline" className="gap-1">
            <Flag className="h-3 w-3" /> {percent}% complete · {completed}/{path.nodes.length} steps
          </Badge>
        }
      />

      <Progress value={percent} className="h-2" />

      <JourneyMap
        path={path}
        statuses={statuses}
        courseLinkPrefix="/learner/course"
        height={520}
      />

      <Card>
        <CardHeader>
          <CardTitle>Step-by-step</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {rows.map(({ node, status }) => {
            const course = node.courseId ? getCourseById(node.courseId) : null;
            const a = assignments.find((x) => x.courseId === node.courseId);
            return (
              <div key={node.id} className="flex items-center gap-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-sm font-semibold">
                  {status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : status === "in_progress" ? (
                    <span className="text-northstar-600">●</span>
                  ) : status === "overdue" ? (
                    <span className="text-rose-600">!</span>
                  ) : status === "expiring" ? (
                    <Hourglass className="h-4 w-4 text-amber-500" />
                  ) : status === "locked" ? (
                    <span className="text-muted-foreground">🔒</span>
                  ) : (
                    <Star className="h-4 w-4 text-sky-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{node.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {node.kind === "course" ? "Course" : node.kind === "policy" ? "Policy attestation" : node.kind === "survey" ? "Needs assessment" : node.kind === "live" ? "Live session" : node.kind}
                    {course && ` · ${course.durationMinutes} min`}
                    {a?.dueAt && ` · Due ${formatDate(a.dueAt)}`}
                    {a?.completedAt && ` · Completed ${formatDate(a.completedAt)}`}
                  </div>
                </div>
                <div className="hidden sm:block">
                  <StatusLabel status={status} />
                </div>
                {course && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/learner/course/${course.id}`}>
                      {status === "completed" ? "Review" : status === "in_progress" ? "Continue" : "Open"}{" "}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusLabel({ status }: { status: string | undefined }) {
  const map: Record<string, { variant: "default" | "success" | "warning" | "info" | "destructive" | "outline"; label: string }> = {
    completed: { variant: "success", label: "Completed" },
    in_progress: { variant: "info", label: "In progress" },
    available: { variant: "outline", label: "Available" },
    overdue: { variant: "destructive", label: "Overdue" },
    expiring: { variant: "warning", label: "Expiring" },
    locked: { variant: "outline", label: "Locked" },
  };
  const cfg = status ? map[status] : undefined;
  return <Badge variant={cfg?.variant ?? "outline"}>{cfg?.label ?? "—"}</Badge>;
}
