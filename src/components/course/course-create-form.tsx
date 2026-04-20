"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Link as LinkIcon,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { createCourse } from "@/app/actions/mutations";
import { cn } from "@/lib/utils";

const types = [
  { id: "authored", icon: BookOpen, title: "Authored course", desc: "Build lessons, videos, and quizzes in Northstar's editor." },
  { id: "scorm", icon: PlayCircle, title: "SCORM package", desc: "Upload a .zip package. We handle launch and completion tracking." },
  { id: "aicc", icon: LinkIcon, title: "AICC", desc: "Legacy AICC packages for existing content libraries." },
  { id: "live_session", icon: Video, title: "Live session", desc: "Instructor-led, in-person or virtual with registration." },
  { id: "policy_attestation", icon: ShieldCheck, title: "Policy attestation", desc: "Upload a PDF; learners read and attest." },
  { id: "evidence_task", icon: ClipboardCheck, title: "Evidence task", desc: "Learners upload evidence; admins review and approve." },
  { id: "survey", icon: FileText, title: "Survey / needs assessment", desc: "Answers drive downstream course assignments." },
] as const;

type TypeId = (typeof types)[number]["id"];

export function CourseCreateForm({
  backHref,
  coursesHref,
  orgId,
  workspaceId,
  orgSlug,
  wsSlug,
}: {
  backHref: string;
  coursesHref: string;
  orgId: string;
  workspaceId: string;
  orgSlug: string;
  wsSlug: string;
}) {
  const [type, setType] = React.useState<TypeId | null>(null);
  const [title, setTitle] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [duration, setDuration] = React.useState("20");
  const [required, setRequired] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [createdId, setCreatedId] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const selectedType = types.find((t) => t.id === type);

  if (saved && selectedType) {
    return (
      <Card className="border-emerald-500/40 bg-emerald-500/5">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Draft created</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            <strong className="text-foreground">{title || "Untitled course"}</strong> was saved as a draft{" "}
            <Badge variant="outline" className="ml-1">{selectedType.title}</Badge>. You can open it in the builder or
            publish when ready.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" onClick={() => { setSaved(false); setTitle(""); setSummary(""); setType(null); setCreatedId(null); }}>
              Create another
            </Button>
            {createdId && (
              <Button asChild>
                <Link href={`${coursesHref}/${createdId}/edit`}>
                  Open builder <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link href={coursesHref}>Back to courses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="space-y-3">
        <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          1. Pick a course type
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {types.map((t) => {
            const isSelected = type === t.id;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setType(t.id)}
                className={cn(
                  "group rounded-xl border bg-card p-4 text-left transition",
                  isSelected
                    ? "border-primary/60 bg-primary/5 shadow-sm ring-2 ring-primary/20"
                    : "hover:border-primary/40 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                    )}
                  >
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div className="font-semibold">{t.title}</div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Card className={cn(!type && "opacity-70")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">2. Details</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!type || !title.trim()) return;
              const fd = new FormData();
              fd.set("orgId", orgId);
              fd.set("workspaceId", workspaceId);
              fd.set("orgSlug", orgSlug);
              fd.set("wsSlug", wsSlug);
              fd.set("type", type);
              fd.set("title", title);
              fd.set("summary", summary);
              fd.set("durationMinutes", duration);
              if (required) fd.set("required", "on");
              startTransition(async () => {
                const res = await createCourse(fd);
                if (res.ok) {
                  setCreatedId(res.id);
                  setSaved(true);
                  toast({
                    title: "Course draft saved",
                    description: `${title} is ready to edit in the builder.`,
                    variant: "success",
                  });
                  router.refresh();
                }
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                required
                placeholder="e.g. Workplace Violence Prevention"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={!type}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                placeholder="A one-line description learners will see."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={!type}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="duration">Duration (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  disabled={!type}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="required">Required?</Label>
                <div className="mt-1 flex h-9 items-center rounded-md border px-3">
                  <input
                    id="required"
                    type="checkbox"
                    checked={required}
                    onChange={(e) => setRequired(e.target.checked)}
                    disabled={!type}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="ml-2 text-xs text-muted-foreground">
                    Mark as required by default
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-1.5 font-medium text-foreground">
                <Sparkles className="h-3 w-3" /> AI assignment context
              </div>
              You'll add a richer AI context (regulatory references, job families, policy PDFs) in the builder. For now
              we'll scaffold a blank context field.
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button type="button" variant="ghost" asChild>
                <Link href={backHref}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={!type || !title.trim() || pending}>
                {pending ? "Saving…" : "Save draft"} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
