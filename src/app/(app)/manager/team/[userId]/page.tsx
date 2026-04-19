import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BellRing } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  getAssignmentsForUser,
  getCertificatesForUser,
  getCourseById,
  getUserById,
} from "@/lib/data";
import { formatDate, initials } from "@/lib/utils";

export default async function LearnerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const learner = getUserById(userId);
  if (!learner) notFound();
  const assignments = getAssignmentsForUser(userId);
  const certs = getCertificatesForUser(userId);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/manager/team">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to team
        </Link>
      </Button>

      <div className="flex flex-col gap-4 rounded-2xl border bg-gradient-to-br from-card to-card/50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-lg">{initials(learner.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-display text-2xl font-semibold">{learner.name}</div>
            <div className="text-sm text-muted-foreground">
              {learner.employee?.title} · {learner.employee?.department} · {learner.employee?.campus ?? learner.employee?.location}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Hired {learner.employee?.hireDate ? formatDate(learner.employee.hireDate) : "—"} · {learner.employee?.workerType?.replace("_", " ")}
            </div>
          </div>
        </div>
        <Button>
          <BellRing className="h-4 w-4" /> Send reminder
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {assignments.map((a) => {
            const course = a.courseId ? getCourseById(a.courseId) : null;
            if (!course) return null;
            return (
              <div key={a.id} className="flex items-center gap-4 py-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${course.thumbnailColor} text-lg`}>
                  {course.thumbnailEmoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{course.title}</span>
                    <Badge variant="outline" className="text-[10px]">{course.category}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {a.status === "completed" && a.completedAt
                      ? `Completed ${formatDate(a.completedAt)}${a.score ? ` · Score ${Math.round(a.score * 100)}%` : ""}`
                      : a.dueAt
                      ? `Due ${formatDate(a.dueAt)}`
                      : "Self-paced"}
                    {a.source && ` · ${a.source}`}
                  </div>
                  <Progress value={a.progress * 100} className="mt-2 h-1.5" />
                </div>
                <StatusBadge status={a.status} />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Credentials</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {certs.map((c) => {
            const course = c.courseId ? getCourseById(c.courseId) : null;
            return (
              <div key={c.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-sm font-medium">{course?.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {c.credentialCode} · Issued {formatDate(c.issuedAt)}
                    {c.expiresAt ? ` · ${c.status === "expired" ? "Expired" : "Expires"} ${formatDate(c.expiresAt)}` : ""}
                  </div>
                </div>
                <Badge variant={c.status === "expired" ? "destructive" : c.status === "expiring" ? "warning" : "success"}>
                  {c.status}
                </Badge>
              </div>
            );
          })}
          {certs.length === 0 && (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No credentials yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const m: Record<string, { variant: "success" | "warning" | "info" | "destructive" | "outline"; label: string }> = {
    completed: { variant: "success", label: "Completed" },
    in_progress: { variant: "info", label: "In progress" },
    overdue: { variant: "destructive", label: "Overdue" },
    not_started: { variant: "outline", label: "Not started" },
    expired: { variant: "destructive", label: "Expired" },
  };
  const cfg = m[status] ?? m.not_started;
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
