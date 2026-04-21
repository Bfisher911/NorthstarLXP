import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Edit3,
  FileText,
  HelpCircle,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssignCourseDialog } from "@/components/course/assign-course-dialog";
import {
  assignments as allAssignments,
  getCourseById,
  getOrgBySlug,
  getUserById,
  getWorkspaceBySlug,
  users as allUsers,
} from "@/lib/data";
import { formatDate, relativeDate } from "@/lib/utils";

export default async function WsCourseDetail({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string; courseId: string }>;
}) {
  const { orgSlug, wsSlug, courseId } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const course = getCourseById(courseId);
  if (!course) notFound();

  const ass = allAssignments.filter((a) => a.courseId === courseId);
  const completed = ass.filter((a) => a.status === "completed").length;
  const inProgress = ass.filter((a) => a.status === "in_progress").length;
  const overdue = ass.filter((a) => a.status === "overdue").length;
  const notStarted = ass.filter((a) => a.status === "not_started").length;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/org/${orgSlug}/w/${wsSlug}/courses`}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to courses
        </Link>
      </Button>

      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${course.thumbnailColor} p-8 text-white`}>
        <div aria-hidden className="absolute inset-0 bg-star-field opacity-40" />
        <div className="relative flex items-start justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-white/30 bg-white/10 text-white">{course.category}</Badge>
              <Badge variant="outline" className="border-white/30 bg-white/10 text-white capitalize">{course.type.replace("_", " ")}</Badge>
              {course.shareToOrg && <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Shared org-wide</Badge>}
              {course.required && <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Required</Badge>}
              {course.published ? (
                <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Published</Badge>
              ) : (
                <Badge variant="outline" className="border-white/30 bg-white/10 text-white">Draft</Badge>
              )}
            </div>
            <h1 className="font-display text-3xl font-semibold">{course.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-white/90">{course.description}</p>
          </div>
          <div className="text-7xl opacity-90">{course.thumbnailEmoji}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link href={`/org/${orgSlug}/w/${wsSlug}/courses/${course.id}/edit`}>
            <Edit3 className="h-4 w-4" /> Open in builder
          </Link>
        </Button>
        <AssignCourseDialog
          courseId={course.id}
          courseTitle={course.title}
          triggerVariant="outline"
          candidates={allUsers
            .filter((u) => u.orgId === org.id && u.roles.some((r) => r.role === "learner"))
            .map((u) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              title: u.employee?.title,
              department: u.employee?.department,
            }))}
        />
        <Button variant="outline">
          <Copy className="h-4 w-4" /> Duplicate
        </Button>
        <Button variant="outline">
          <HelpCircle className="h-4 w-4" /> Preview as learner
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <MiniStat label="Assigned" value={ass.length} color="text-sky-600" />
        <MiniStat label="Completed" value={completed} color="text-emerald-600" />
        <MiniStat label="In progress" value={inProgress} color="text-northstar-600" />
        <MiniStat label="Overdue" value={overdue} color="text-rose-600" />
      </div>

      <Tabs defaultValue="structure">
        <TabsList>
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
          <TabsTrigger value="ai">AI context</TabsTrigger>
          <TabsTrigger value="learners">Learners</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {(course.modules ?? []).map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{m.title}</div>
                    <div className="text-xs text-muted-foreground">{m.type}{m.durationMinutes ? ` · ${m.durationMinutes} min` : ""}</div>
                  </div>
                  <Button variant="ghost" size="sm"><Edit3 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
              {(!course.modules || course.modules.length === 0) && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {course.type === "policy_attestation"
                    ? "This is a read-and-acknowledge course. Upload the policy PDF and configure the attestation text in the builder."
                    : course.type === "live_session"
                    ? "This course is delivered via scheduled sessions."
                    : course.type === "scorm" || course.type === "aicc"
                    ? `${course.type.toUpperCase()} package — launch is handled by the runtime wrapper.`
                    : "No modules yet. Open the builder to add content."}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Audience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="Required" value={course.required ? "Yes" : "No"} />
                <Row label="Renewal" value={course.renewalMonths ? `Every ${course.renewalMonths} months` : "None"} />
                <Row label="Certificate" value={course.certificateEnabled ? "Enabled" : "Disabled"} />
                <Row label="Share to organization" value={course.shareToOrg ? "Enabled" : "Disabled"} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Due date strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <Row label="On assignment" value="+ 14 days" />
                <Row label="On hire (new employees)" value="+ 30 days" />
                <Row label="On renewal" value="Before expiration - 30 days" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-4 w-4 text-violet-500" /> AI assignment context</CardTitle>
              <p className="text-sm text-muted-foreground">Describe who should take this course. Northstar compares this to employee records to suggest assignments.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm">{course.aiContext ?? "Not configured."}</div>
              {course.regulatoryRefs && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Regulatory references:</span> {course.regulatoryRefs.join(", ")}
                </div>
              )}
              <Button variant="outline"><Edit3 className="h-3.5 w-3.5" /> Edit AI context</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learners">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled learners</CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              {ass.slice(0, 10).map((a) => {
                const u = getUserById(a.userId);
                return (
                  <div key={a.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{u?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {u?.employee?.title} · {u?.employee?.department}
                        {a.source && ` · ${a.source}`}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.status === "completed" && a.completedAt
                        ? `Completed ${formatDate(a.completedAt)}`
                        : a.dueAt
                        ? `Due ${relativeDate(a.dueAt)}`
                        : "Self-paced"}
                    </div>
                    <Badge
                      variant={
                        a.status === "completed"
                          ? "success"
                          : a.status === "overdue"
                          ? "destructive"
                          : a.status === "in_progress"
                          ? "info"
                          : "outline"
                      }
                    >
                      {a.status.replace("_", " ")}
                    </Badge>
                  </div>
                );
              })}
              {notStarted > 0 && <div className="py-2 text-xs text-muted-foreground">+ {notStarted} not started</div>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Manual notification sender</CardTitle>
              <p className="text-sm text-muted-foreground">Send a one-off message to a filtered slice of this course's audience.</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  "All assigned users",
                  "Users who have not started",
                  "Started but not completed",
                  "Users who completed",
                  "Overdue users",
                  "Due-soon users",
                  "Managers of assigned users",
                ].map((aud) => (
                  <button
                    key={aud}
                    className="flex items-center justify-between rounded-lg border p-3 text-left text-sm transition hover:border-primary/60"
                  >
                    <span>{aud}</span>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" /> Each message includes a personalized launch link that drops the user right into this course.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className={`font-display text-2xl font-semibold ${color}`}>{value}</div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
