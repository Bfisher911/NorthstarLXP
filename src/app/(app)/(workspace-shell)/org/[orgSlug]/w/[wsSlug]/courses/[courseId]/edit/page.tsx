import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  HelpCircle,
  ImageIcon,
  ListChecks,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getCourseById, getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";

const tools = [
  { icon: FileText, title: "Lesson page" },
  { icon: Video, title: "Video" },
  { icon: ImageIcon, title: "Image" },
  { icon: HelpCircle, title: "Quiz" },
  { icon: ListChecks, title: "Checkpoint" },
  { icon: ShieldCheck, title: "Attestation" },
];

export default async function CourseBuilderPage({
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

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="flex items-center justify-between gap-2 border-b bg-card/70 p-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/org/${orgSlug}/w/${wsSlug}/courses/${course.id}`}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Input defaultValue={course.title} className="h-8 w-[340px] font-semibold" />
            <Badge variant={course.published ? "success" : "warning"}>
              {course.published ? "Published" : "Draft"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm"><Eye className="h-3.5 w-3.5" /> Preview</Button>
          <Button variant="outline" size="sm"><Save className="h-3.5 w-3.5" /> Save draft</Button>
          <Button size="sm"><CheckCircle2 className="h-3.5 w-3.5" /> Publish</Button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[260px_1fr_320px]">
        {/* Structure sidebar */}
        <aside className="border-r bg-card/40 p-3">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Structure
          </div>
          <div className="space-y-1">
            {(course.modules ?? []).map((m, i) => (
              <div
                key={m.id}
                className="group flex cursor-pointer items-center gap-2 rounded-md border bg-background p-2 transition hover:border-primary/50"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-muted text-[10px] font-semibold">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium">{m.title}</div>
                  <div className="text-[10px] text-muted-foreground">{m.type}</div>
                </div>
                <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </div>
            ))}
            <Button variant="outline" size="sm" className="mt-2 w-full">
              <Plus className="h-3.5 w-3.5" /> Add section
            </Button>
          </div>

          <div className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Insert
          </div>
          <div className="grid grid-cols-2 gap-2">
            {tools.map((t) => (
              <button
                key={t.title}
                className="flex flex-col items-start gap-1 rounded-md border bg-background p-2 text-left text-xs hover:border-primary/50"
              >
                <t.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{t.title}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <main className="bg-gradient-to-b from-background to-muted/30 p-8">
          <div className="mx-auto max-w-3xl space-y-4">
            {(course.modules ?? []).map((m) => (
              <Card key={m.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{m.title}</CardTitle>
                  <Badge variant="outline" className="text-[10px] capitalize">{m.type}</Badge>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {m.body && <p>{m.body}</p>}
                  {m.type === "video" && (
                    <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/40 text-muted-foreground">
                      Drop MP4 / paste video URL
                    </div>
                  )}
                  {m.type === "quiz" && m.questions && (
                    <div className="space-y-3">
                      {m.questions.map((q) => (
                        <div key={q.id} className="rounded-lg border p-3">
                          <div className="text-sm font-medium">{q.prompt}</div>
                          <div className="mt-2 space-y-1.5">
                            {q.options.map((o) => (
                              <div key={o.id} className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs ${o.correct ? "border-emerald-400 bg-emerald-500/5" : ""}`}>
                                <span className="inline-block h-2 w-2 rounded-full bg-muted" />
                                {o.label}
                                {o.correct && <Badge variant="success" className="ml-auto text-[10px]">Correct</Badge>}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </main>

        {/* Settings drawer */}
        <aside className="border-l bg-card/40 p-4 text-sm">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            <Settings className="h-3 w-3" /> Settings
          </div>
          <div className="mt-3 space-y-4">
            <div>
              <Label>Category</Label>
              <Input defaultValue={course.category} className="mt-1" />
            </div>
            <div>
              <Label>Duration (min)</Label>
              <Input defaultValue={course.durationMinutes} className="mt-1" type="number" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Required</div>
                <div className="text-[11px] text-muted-foreground">Mark as mandatory</div>
              </div>
              <Switch defaultChecked={course.required} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Certificate</div>
                <div className="text-[11px] text-muted-foreground">Award on completion</div>
              </div>
              <Switch defaultChecked={course.certificateEnabled} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Renews</div>
                <div className="text-[11px] text-muted-foreground">{course.renewalMonths ? `${course.renewalMonths} months` : "No"}</div>
              </div>
              <Switch defaultChecked={!!course.renewalMonths} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Share to org</div>
                <div className="text-[11px] text-muted-foreground">Usable in org-wide paths</div>
              </div>
              <Switch defaultChecked={course.shareToOrg} />
            </div>

            <RetakePolicyControl
              policy={course.retakePolicy ?? "window_only"}
              windowDays={course.retakeWindowDays ?? 30}
            />

            <div className="rounded-lg border bg-gradient-to-br from-violet-500/5 to-primary/5 p-3">
              <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
                <Brain className="h-3 w-3" /> AI context
              </div>
              <p className="text-xs text-muted-foreground">
                {course.aiContext ?? "No context yet."}
              </p>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                <Edit3 className="h-3 w-3" /> Edit
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function RetakePolicyControl({
  policy,
  windowDays,
}: {
  policy: "review_only" | "window_only" | "anytime";
  windowDays: number;
}) {
  const labels: Record<typeof policy, string> = {
    review_only: "Review only (never refresh compliance)",
    window_only: "Retake during renewal window",
    anytime: "Retake anytime (refresh compliance at will)",
  };
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        Retake policy
      </div>
      <div className="space-y-2 text-xs">
        {(["review_only", "window_only", "anytime"] as const).map((p) => (
          <label key={p} className="flex cursor-pointer items-start gap-2">
            <input
              type="radio"
              name="retake_policy"
              value={p}
              defaultChecked={policy === p}
              className="mt-0.5 h-3.5 w-3.5 accent-primary"
            />
            <span className="text-sm text-foreground">{labels[p]}</span>
          </label>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Window before expiry</span>
        <span className="font-mono text-foreground">{windowDays} days</span>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Review is always available after completion. This setting controls whether retakes refresh
        the learner&rsquo;s compliance date.
      </p>
    </div>
  );
}
