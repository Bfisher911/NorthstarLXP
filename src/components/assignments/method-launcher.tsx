"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Check,
  Copy,
  FileSpreadsheet,
  Link2,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { assignCourse } from "@/app/actions/mutations";
import { cn, initials } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  email: string;
  title?: string;
  department?: string;
}

interface CourseOption {
  id: string;
  title: string;
}

type Kind = "manual" | "csv" | "self";

export function AssignmentMethodLauncher({
  kind,
  learners,
  courses,
  trigger,
}: {
  kind: Kind;
  learners: Candidate[];
  courses: CourseOption[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-background/70 backdrop-blur data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[94vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
              {kind === "manual" && <UserPlus className="h-4 w-4 text-primary" />}
              {kind === "csv" && <FileSpreadsheet className="h-4 w-4 text-primary" />}
              {kind === "self" && <Link2 className="h-4 w-4 text-primary" />}
              {kind === "manual" && "Manual direct assignment"}
              {kind === "csv" && "CSV bulk upload"}
              {kind === "self" && "Self-enrollment link"}
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="p-4">
            {kind === "manual" && (
              <ManualFlow
                learners={learners}
                courses={courses}
                onDone={() => setOpen(false)}
              />
            )}
            {kind === "csv" && (
              <CsvFlow learners={learners} courses={courses} onDone={() => setOpen(false)} />
            )}
            {kind === "self" && <SelfEnrollFlow courses={courses} />}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------- Manual ----------------
function ManualFlow({
  learners,
  courses,
  onDone,
}: {
  learners: Candidate[];
  courses: CourseOption[];
  onDone: () => void;
}) {
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [dueAt, setDueAt] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return learners;
    return learners.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.title?.toLowerCase().includes(q) ||
        l.department?.toLowerCase().includes(q)
    );
  }, [learners, query]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = () => {
    if (!courseId || selected.size === 0) return;
    startTransition(async () => {
      const res = await assignCourse({
        courseId,
        userIds: Array.from(selected),
        method: "manual",
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      if (res.ok) {
        toast({
          title: "Assignments created",
          description: `${res.created} ${res.created === 1 ? "person" : "people"} assigned.`,
          variant: "success",
        });
        onDone();
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Course</Label>
        <select
          className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="max-h-56 overflow-y-auto scrollbar-thin rounded-lg border">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No matches</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((l) => {
              const isSel = selected.has(l.id);
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => toggle(l.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 text-left transition",
                      isSel ? "bg-primary/10" : "hover:bg-accent/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border",
                        isSel ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      )}
                    >
                      {isSel && <Check className="h-3 w-3" />}
                    </span>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                      {initials(l.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{l.name}</div>
                      <div className="truncate text-[11px] text-muted-foreground">
                        {l.title ?? l.email}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div>
        <Label>Due date (optional)</Label>
        <Input
          type="date"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
          className="mt-1"
        />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Badge variant="secondary">{selected.size} selected</Badge>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onDone}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={pending || selected.size === 0 || !courseId}
          >
            <Send className="h-4 w-4" />
            {pending ? "Assigning…" : `Assign to ${selected.size || 0}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------- CSV ----------------
function CsvFlow({
  learners,
  courses,
  onDone,
}: {
  learners: Candidate[];
  courses: CourseOption[];
  onDone: () => void;
}) {
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");
  const [file, setFile] = React.useState<File | null>(null);
  const [parsed, setParsed] = React.useState<{ matched: Candidate[]; unmatched: string[] } | null>(
    null
  );
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const parseCsv = async (f: File) => {
    const text = await f.text();
    const lines = text.split(/\r?\n/).filter(Boolean);
    // Accept first-column as email or user id; skip a header row if present.
    const tokens = lines
      .map((l) => l.split(",")[0].trim().replace(/^"|"$/g, ""))
      .filter(Boolean)
      .filter((t) => t.toLowerCase() !== "email" && t.toLowerCase() !== "user_id");
    const emailMap = new Map(learners.map((l) => [l.email.toLowerCase(), l]));
    const idMap = new Map(learners.map((l) => [l.id, l]));
    const matched: Candidate[] = [];
    const unmatched: string[] = [];
    for (const t of tokens) {
      const m = emailMap.get(t.toLowerCase()) ?? idMap.get(t);
      if (m && !matched.find((x) => x.id === m.id)) matched.push(m);
      else unmatched.push(t);
    }
    setParsed({ matched, unmatched });
  };

  const submit = () => {
    if (!courseId || !parsed || parsed.matched.length === 0) return;
    startTransition(async () => {
      const res = await assignCourse({
        courseId,
        userIds: parsed.matched.map((m) => m.id),
        method: "csv",
        source: file?.name,
      });
      if (res.ok) {
        toast({
          title: "CSV processed",
          description: `${res.created} new assignment${res.created === 1 ? "" : "s"} created.`,
          variant: "success",
        });
        onDone();
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Course</Label>
        <select
          className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>CSV file</Label>
        <input
          type="file"
          accept=".csv,text/csv"
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border file:bg-background file:px-3 file:py-1 file:text-sm file:font-medium"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            setParsed(null);
            if (f) parseCsv(f);
          }}
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          First column should contain either email or user ID. Header row auto-detected.
        </p>
      </div>
      {parsed && (
        <div className="rounded-lg border bg-muted/20 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Badge variant="success">{parsed.matched.length} matched</Badge>
            {parsed.unmatched.length > 0 && (
              <Badge variant="warning">{parsed.unmatched.length} unmatched</Badge>
            )}
          </div>
          {parsed.unmatched.length > 0 && (
            <div className="mt-2 max-h-20 overflow-y-auto scrollbar-thin font-mono text-[11px] text-muted-foreground">
              {parsed.unmatched.slice(0, 20).map((u, i) => (
                <div key={i}>· {u}</div>
              ))}
              {parsed.unmatched.length > 20 && <div>… +{parsed.unmatched.length - 20}</div>}
            </div>
          )}
        </div>
      )}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={pending || !parsed || parsed.matched.length === 0 || !courseId}
        >
          <Send className="h-4 w-4" />
          {pending
            ? "Assigning…"
            : parsed
            ? `Assign to ${parsed.matched.length}`
            : "Parse first"}
        </Button>
      </div>
    </div>
  );
}

// ---------------- Self enrollment ----------------
function SelfEnrollFlow({ courses }: { courses: CourseOption[] }) {
  const [courseId, setCourseId] = React.useState(courses[0]?.id ?? "");
  const { toast } = useToast();
  const url =
    typeof window !== "undefined" && courseId
      ? `${window.location.origin}/learner/course/${courseId}`
      : "";

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Share it anywhere — it launches the course directly if the user is assigned.",
        variant: "success",
      });
    } catch {
      toast({ title: "Clipboard blocked", variant: "error" });
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Course</Label>
        <select
          className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Self-enrollment URL</Label>
        <div className="mt-1 flex items-center gap-2">
          <Input readOnly value={url} className="font-mono text-xs" />
          <Button variant="outline" onClick={copy}>
            <Copy className="h-4 w-4" /> Copy
          </Button>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          If the user already has an assignment, this goes straight to the course player. Otherwise it prompts them to enroll.
        </p>
      </div>
      <div className="rounded-lg border bg-muted/20 p-3 text-xs text-muted-foreground">
        <Users className="mr-1 inline h-3 w-3" /> You can combine self-enrollment with smart-group
        gating — only matching learners can enroll.
      </div>
      <div className="flex items-center justify-end pt-2">
        <Button variant="outline" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <ArrowRight className="h-4 w-4" /> Preview
          </a>
        </Button>
      </div>
    </div>
  );
}
