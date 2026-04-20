import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  HelpCircle,
  ListChecks,
  Lock,
  PlayCircle,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { requireSession } from "@/lib/auth";
import { getAssignmentsForUser, getCourseById } from "@/lib/data";
import { AttestForm } from "@/components/learner/attest-form";
import { CoursePlayerControls } from "@/components/learner/course-player-controls";
import { formatDate } from "@/lib/utils";
import type { CourseModule } from "@/lib/types";

const moduleIcon = {
  lesson: FileText,
  video: Video,
  quiz: HelpCircle,
  checkpoint: ListChecks,
  attestation: ShieldCheck,
  file: Download,
} as const;

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) notFound();
  const { user } = await requireSession();
  const a = getAssignmentsForUser(user.id).find((x) => x.courseId === courseId);

  const progress = a ? Math.round(a.progress * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/learner/training">
            <ArrowLeft className="h-3.5 w-3.5" /> All training
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${course.thumbnailColor} p-10 text-white shadow-lg`}>
            <div aria-hidden className="absolute inset-0 bg-star-field opacity-40" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    {course.category}
                  </Badge>
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    {course.type === "authored"
                      ? "Authored course"
                      : course.type === "live_session"
                      ? "Live session"
                      : course.type === "policy_attestation"
                      ? "Policy attestation"
                      : course.type === "survey"
                      ? "Needs assessment"
                      : course.type === "evidence_task"
                      ? "Evidence task"
                      : course.type.toUpperCase()}
                  </Badge>
                  {course.required && (
                    <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                      Required
                    </Badge>
                  )}
                </div>
                <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">{course.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/90">{course.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/80">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {course.durationMinutes} min
                  </span>
                  {course.renewalMonths && (
                    <span>Renews every {course.renewalMonths} months</span>
                  )}
                  {course.regulatoryRefs && (
                    <span>Regulatory: {course.regulatoryRefs.join(", ")}</span>
                  )}
                </div>
              </div>
              <div className="text-8xl opacity-90">{course.thumbnailEmoji}</div>
            </div>
          </div>

          {course.type === "authored" && course.modules && (
            <Card>
              <CardHeader>
                <CardTitle>Modules</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {course.modules.map((m, i) => (
                  <ModuleRow key={m.id} module={m} index={i} progress={a?.progress ?? 0} />
                ))}
              </CardContent>
            </Card>
          )}

          {course.type === "policy_attestation" && (
            <Card>
              <CardHeader>
                <CardTitle>Policy document</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{course.policyFile?.name ?? "Policy document"}</div>
                    <div className="text-xs text-muted-foreground">{course.policyFile?.size ?? "—"}</div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
                <AttestForm
                  userId={user.id}
                  courseId={course.id}
                  statements={[
                    "I have read the Code of Conduct and I understand my responsibilities as a workforce member.",
                    "I understand that failure to comply may result in corrective action up to and including termination.",
                  ]}
                />
              </CardContent>
            </Card>
          )}

          {course.type === "live_session" && course.scheduledSessions && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming sessions</CardTitle>
              </CardHeader>
              <CardContent className="divide-y">
                {course.scheduledSessions.map((s) => (
                  <div key={s.id} className="flex items-center gap-4 py-3">
                    <div className="rounded-lg border px-3 py-2 text-center">
                      <div className="text-xs text-muted-foreground">{formatDate(s.startsAt, { month: "short" })}</div>
                      <div className="font-display text-lg font-semibold">
                        {formatDate(s.startsAt, { day: "numeric" })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{s.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.location} · {s.instructor} · {s.registered}/{s.capacity} registered
                      </div>
                    </div>
                    <Button size="sm">Register</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {a?.dueAt && (
                <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Due: </span>
                  <span className="font-medium">{formatDate(a.dueAt)}</span>
                  {a.status === "overdue" && <Badge variant="destructive" className="ml-2">Overdue</Badge>}
                </div>
              )}
              {a?.source && (
                <div className="rounded-lg border bg-muted/40 px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Assigned because: </span>
                  <span className="font-medium">{a.source}</span>
                </div>
              )}
              <CoursePlayerControls
                initialProgress={progress}
                alreadyCompleted={a?.status === "completed"}
                courseTitle={course.title}
                nextUpHref="/learner/journey"
                userId={user.id}
                courseId={course.id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <DetailRow
                icon={<BookOpen className="h-3.5 w-3.5" />}
                label="Type"
                value={course.type.replace("_", " ")}
              />
              <DetailRow
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Duration"
                value={`${course.durationMinutes} min`}
              />
              <DetailRow
                icon={<Users className="h-3.5 w-3.5" />}
                label="Audience"
                value={course.required ? "All required staff" : "Optional development"}
              />
              {course.renewalMonths && (
                <DetailRow
                  icon={<ClipboardCheck className="h-3.5 w-3.5" />}
                  label="Renewal"
                  value={`Every ${course.renewalMonths} months`}
                />
              )}
              <div className="pt-2">
                <div className="mb-1.5 text-xs text-muted-foreground">Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {course.tags.map((t) => (
                    <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ModuleRow({
  module,
  index,
  progress,
}: {
  module: CourseModule;
  index: number;
  progress: number;
}) {
  const Icon = moduleIcon[module.type] ?? FileText;
  // Naive per-module completion based on aggregate progress
  const done = (index + 1) / 10 <= progress;
  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full border ${
          done ? "border-emerald-500 bg-emerald-500 text-white" : "bg-background text-muted-foreground"
        }`}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">{module.title}</div>
        <div className="text-xs text-muted-foreground">
          {module.type} {module.durationMinutes ? `· ${module.durationMinutes} min` : ""}
        </div>
      </div>
      {done ? (
        <Badge variant="success">Done</Badge>
      ) : progress === 0 && index > 0 ? (
        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
          <Lock className="h-3 w-3" /> Locked
        </span>
      ) : (
        <Button variant="outline" size="sm">
          Start
        </Button>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium capitalize">{value}</span>
    </div>
  );
}

