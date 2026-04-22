"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Eye,
  FileText,
  HelpCircle,
  Info,
  ListChecks,
  PlayCircle,
  Plus,
  Save,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Undo2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { LessonProse } from "@/components/learner/lesson-prose";
import { QuizRunner } from "@/components/learner/quiz-runner";
import { saveCourse } from "@/app/actions/mutations";
import type { Course, CourseModule, QuizQuestion } from "@/lib/types";
import { cn } from "@/lib/utils";

type ModuleType = CourseModule["type"];

const MODULE_ICON: Record<ModuleType, React.ComponentType<{ className?: string }>> = {
  lesson: FileText,
  video: Video,
  quiz: HelpCircle,
  checkpoint: ListChecks,
  attestation: ShieldCheck,
  file: FileText,
};

const MODULE_LABEL: Record<ModuleType, string> = {
  lesson: "Lesson",
  video: "Video",
  quiz: "Quiz",
  checkpoint: "Checkpoint",
  attestation: "Attestation",
  file: "Download",
};

const DEFAULT_QUESTION = (): QuizQuestion => ({
  id: randomId(),
  prompt: "New question",
  type: "single",
  options: [
    { id: randomId(), label: "Option A", correct: true },
    { id: randomId(), label: "Option B" },
  ],
  explanation: "",
});

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export function CourseBuilder({
  course,
  backHref,
  viewHref,
}: {
  course: Course;
  backHref: string;
  viewHref: string;
}) {
  const router = useRouter();
  const { toast } = useToast();

  // --------- Editable draft state ---------
  const initialDraft = React.useMemo(() => cloneDraft(course), [course]);
  const [draft, setDraft] = React.useState<DraftCourse>(initialDraft);
  const [pending, startTransition] = React.useTransition();
  const [activeModuleId, setActiveModuleId] = React.useState<string | null>(
    draft.modules[0]?.id ?? null
  );
  const [preview, setPreview] = React.useState(false);

  // Mark dirty by deep-compare of stable shape — cheap for this size.
  const dirty = React.useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initialDraft),
    [draft, initialDraft]
  );

  const activeModule =
    draft.modules.find((m) => m.id === activeModuleId) ?? draft.modules[0] ?? null;

  // --------- Mutations ---------
  const save = (opts: { publish?: boolean } = {}) => {
    startTransition(async () => {
      const res = await saveCourse({
        id: draft.id,
        title: draft.title,
        summary: draft.summary,
        description: draft.description,
        category: draft.category,
        tags: draft.tags,
        durationMinutes: draft.durationMinutes,
        required: draft.required,
        renewalMonths: draft.renewalMonths,
        certificateEnabled: draft.certificateEnabled,
        shareToOrg: draft.shareToOrg,
        aiContext: draft.aiContext,
        retakePolicy: draft.retakePolicy,
        retakeWindowDays: draft.retakeWindowDays,
        learningObjectives: draft.learningObjectives,
        overview: draft.overview,
        references: draft.references,
        modules: draft.modules,
        published: opts.publish ? true : draft.published,
      });
      if (res.ok) {
        if (opts.publish) {
          setDraft((d) => ({ ...d, published: true }));
        }
        toast({
          title: opts.publish ? "Course published" : "Course saved",
          description: `${draft.title} · ${draft.modules.length} module${
            draft.modules.length === 1 ? "" : "s"
          }`,
          variant: "success",
        });
        router.refresh();
      } else {
        toast({ title: "Save failed", description: res.error, variant: "error" });
      }
    });
  };

  const revert = () => {
    setDraft(initialDraft);
    toast({ title: "Reverted to last saved", variant: "default" });
  };

  // --------- Module operations ---------
  const addModule = (type: ModuleType) => {
    const mod: CourseModule = {
      id: randomId(),
      title: `New ${MODULE_LABEL[type].toLowerCase()}`,
      type,
      durationMinutes: type === "quiz" ? 5 : 3,
      body:
        type === "lesson"
          ? "## Section heading\n\nStart typing your lesson body. You can use **bold**, bulleted and numbered lists, quotes, headings, and tables."
          : type === "video"
          ? "A short description of what this video covers. Transcript appears here."
          : type === "attestation"
          ? "I have read and understand the policy."
          : type === "checkpoint"
          ? "Describe what the learner should do at this checkpoint."
          : type === "file"
          ? "Describe the downloadable resource."
          : undefined,
      questions: type === "quiz" ? [DEFAULT_QUESTION()] : undefined,
    };
    setDraft((d) => ({ ...d, modules: [...d.modules, mod] }));
    setActiveModuleId(mod.id);
  };

  const updateModule = (id: string, patch: Partial<CourseModule>) =>
    setDraft((d) => ({
      ...d,
      modules: d.modules.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    }));

  const deleteModule = (id: string) => {
    setDraft((d) => {
      const next = d.modules.filter((m) => m.id !== id);
      if (activeModuleId === id) {
        setActiveModuleId(next[0]?.id ?? null);
      }
      return { ...d, modules: next };
    });
  };

  const moveModule = (id: string, dir: -1 | 1) => {
    setDraft((d) => {
      const idx = d.modules.findIndex((m) => m.id === id);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= d.modules.length) return d;
      const next = [...d.modules];
      [next[idx], next[target]] = [next[target], next[idx]];
      return { ...d, modules: next };
    });
  };

  const duplicateModule = (id: string) => {
    setDraft((d) => {
      const i = d.modules.findIndex((m) => m.id === id);
      if (i < 0) return d;
      const src = d.modules[i];
      const copy: CourseModule = {
        ...src,
        id: randomId(),
        title: `${src.title} (copy)`,
        questions: src.questions?.map((q) => ({
          ...q,
          id: randomId(),
          options: q.options.map((o) => ({ ...o, id: randomId() })),
        })),
      };
      const next = [...d.modules];
      next.splice(i + 1, 0, copy);
      return { ...d, modules: next };
    });
  };

  // --------- Quiz helpers ---------
  const addQuestion = (moduleId: string) => {
    updateModule(moduleId, {
      questions: [
        ...(draft.modules.find((m) => m.id === moduleId)?.questions ?? []),
        DEFAULT_QUESTION(),
      ],
    });
  };

  const updateQuestion = (moduleId: string, qid: string, patch: Partial<QuizQuestion>) => {
    setDraft((d) => ({
      ...d,
      modules: d.modules.map((m) => {
        if (m.id !== moduleId) return m;
        return {
          ...m,
          questions: (m.questions ?? []).map((q) => (q.id === qid ? { ...q, ...patch } : q)),
        };
      }),
    }));
  };

  const deleteQuestion = (moduleId: string, qid: string) =>
    setDraft((d) => ({
      ...d,
      modules: d.modules.map((m) =>
        m.id !== moduleId
          ? m
          : { ...m, questions: (m.questions ?? []).filter((q) => q.id !== qid) }
      ),
    }));

  // --------- Render ---------
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Toolbar */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-card/80 px-4 py-2 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={backHref}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Link>
          </Button>
          <Input
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
            className="h-8 w-[18rem] font-semibold"
          />
          <Badge variant={draft.published ? "success" : "warning"}>
            {draft.published ? "Published" : "Draft"}
          </Badge>
          {dirty && (
            <Badge variant="outline" className="text-[10px]">
              Unsaved changes
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreview((p) => !p)}>
            <Eye className="h-3.5 w-3.5" /> {preview ? "Back to editor" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={viewHref}>Open detail page</Link>
          </Button>
          {dirty && (
            <Button variant="ghost" size="sm" onClick={revert} disabled={pending}>
              <Undo2 className="h-3.5 w-3.5" /> Revert
            </Button>
          )}
          <Button size="sm" onClick={() => save()} disabled={pending || !dirty}>
            <Save className="h-3.5 w-3.5" /> {pending ? "Saving…" : "Save"}
          </Button>
          {!draft.published && (
            <Button size="sm" onClick={() => save({ publish: true })} disabled={pending}>
              <Send className="h-3.5 w-3.5" /> Publish
            </Button>
          )}
        </div>
      </div>

      {preview ? (
        <CoursePreviewPane draft={draft} />
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          {/* Left — module list */}
          <aside className="border-b bg-muted/20 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Structure · {draft.modules.length}</span>
            </div>
            <ol className="space-y-1 p-2">
              {draft.modules.map((m, i) => {
                const Icon = MODULE_ICON[m.type];
                const isActive = m.id === activeModuleId;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setActiveModuleId(m.id)}
                      className={cn(
                        "group flex w-full items-start gap-2 rounded-md border bg-background px-2 py-2 text-left transition",
                        isActive
                          ? "border-primary/60 bg-primary/5 shadow-sm"
                          : "hover:border-primary/30"
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-md",
                          isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-medium">
                          {i + 1}. {m.title}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {MODULE_LABEL[m.type]}
                          {m.durationMinutes ? ` · ${m.durationMinutes}m` : ""}
                        </div>
                      </div>
                      <span className="invisible flex flex-col gap-0.5 group-hover:visible">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveModule(m.id, -1);
                          }}
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveModule(m.id, 1);
                          }}
                          className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div className="space-y-1 px-2 pb-2">
              <div className="mb-1 mt-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                + Add module
              </div>
              {(
                [
                  ["lesson", FileText],
                  ["video", Video],
                  ["quiz", HelpCircle],
                  ["checkpoint", ListChecks],
                  ["attestation", ShieldCheck],
                  ["file", ClipboardCheck],
                ] as Array<[ModuleType, React.ComponentType<{ className?: string }>]>
              ).map(([t, Icon]) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => addModule(t)}
                  className="flex w-full items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-left text-xs transition hover:border-primary/40"
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  <span className="flex-1">{MODULE_LABEL[t]}</span>
                  <Plus className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </aside>

          {/* Center — module editor */}
          <section className="min-w-0 p-4 lg:p-6">
            {!activeModule ? (
              <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
                <Sparkles className="mb-2 h-5 w-5 text-primary" />
                <div className="font-display text-lg font-semibold">Start with a module</div>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Pick a module type on the left to add your first section. You can reorder,
                  duplicate, or delete anything later.
                </p>
              </div>
            ) : (
              <ModuleEditor
                module={activeModule}
                onChange={(patch) => updateModule(activeModule.id, patch)}
                onDuplicate={() => duplicateModule(activeModule.id)}
                onDelete={() => deleteModule(activeModule.id)}
                onAddQuestion={() => addQuestion(activeModule.id)}
                onUpdateQuestion={(qid, patch) => updateQuestion(activeModule.id, qid, patch)}
                onDeleteQuestion={(qid) => deleteQuestion(activeModule.id, qid)}
              />
            )}
          </section>

          {/* Right — settings drawer */}
          <aside className="border-t bg-muted/20 p-4 lg:border-l lg:border-t-0">
            <CourseSettings draft={draft} setDraft={setDraft} />
          </aside>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Module editor (center pane)
// ============================================================================

function ModuleEditor({
  module: m,
  onChange,
  onDuplicate,
  onDelete,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
}: {
  module: CourseModule;
  onChange: (patch: Partial<CourseModule>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (qid: string, patch: Partial<QuizQuestion>) => void;
  onDeleteQuestion: (qid: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="capitalize">
          {MODULE_LABEL[m.type]}
        </Badge>
        <Input
          value={m.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="h-9 w-full max-w-lg font-semibold"
        />
        <div className="ml-auto flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Minutes</Label>
          <Input
            type="number"
            min={1}
            max={600}
            value={m.durationMinutes ?? 0}
            onChange={(e) => onChange({ durationMinutes: Number(e.target.value) || 0 })}
            className="h-8 w-20"
          />
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5 text-rose-500" /> Delete
          </Button>
        </div>
      </div>

      {m.type === "lesson" || m.type === "video" || m.type === "checkpoint" || m.type === "file" ? (
        <Tabs defaultValue="write">
          <TabsList>
            <TabsTrigger value="write">Write</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="write">
            <textarea
              value={m.body ?? ""}
              onChange={(e) => onChange({ body: e.target.value })}
              className="min-h-[340px] w-full rounded-lg border bg-background p-3 font-mono text-xs leading-relaxed"
              placeholder={
                "## Heading\n\nParagraph text. Use **bold**, - bullets, 1. numbered, > quotes."
              }
            />
            <p className="mt-2 text-[10px] text-muted-foreground">
              Markdown-ish: <code>##</code>/<code>###</code> headings, <code>-</code>/
              <code>*</code> bullets, <code>1.</code> numbered, <code>&gt;</code> quotes,{" "}
              <code>**bold**</code>, pipe tables.
            </p>
          </TabsContent>
          <TabsContent value="preview">
            <div className="rounded-xl border bg-card p-5">
              <LessonProse body={m.body ?? "_Empty_"} />
            </div>
          </TabsContent>
        </Tabs>
      ) : null}

      {m.type === "attestation" && (
        <div className="space-y-3">
          <Label>Attestation statement</Label>
          <textarea
            value={m.body ?? ""}
            onChange={(e) => onChange({ body: e.target.value })}
            className="min-h-[140px] w-full rounded-lg border bg-background p-3 text-sm leading-relaxed"
            placeholder="I have read and understand the policy…"
          />
          <p className="text-xs text-muted-foreground">
            Learners check the statement(s) and type their full name as a signature.
          </p>
        </div>
      )}

      {m.type === "quiz" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Questions · {m.questions?.length ?? 0}</Label>
            <Button variant="outline" size="sm" onClick={onAddQuestion}>
              <Plus className="h-3.5 w-3.5" /> Add question
            </Button>
          </div>
          {(m.questions ?? []).map((q, qi) => (
            <QuizQuestionEditor
              key={q.id}
              index={qi}
              question={q}
              onChange={(patch) => onUpdateQuestion(q.id, patch)}
              onDelete={() => onDeleteQuestion(q.id)}
            />
          ))}
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            <Info className="mr-1 inline h-3 w-3" />
            Pass threshold defaults to 80%. Learners may retake quizzes inside the course at any
            time; the author&rsquo;s retake policy controls whether the compliance date updates.
          </div>
        </div>
      )}
    </div>
  );
}

function QuizQuestionEditor({
  index,
  question,
  onChange,
  onDelete,
}: {
  index: number;
  question: QuizQuestion;
  onChange: (patch: Partial<QuizQuestion>) => void;
  onDelete: () => void;
}) {
  const updateOption = (oid: string, patch: Partial<QuizQuestion["options"][number]>) =>
    onChange({
      options: question.options.map((o) => (o.id === oid ? { ...o, ...patch } : o)),
    });

  const addOption = () =>
    onChange({
      options: [...question.options, { id: randomId(), label: "New option" }],
    });

  const deleteOption = (oid: string) =>
    onChange({ options: question.options.filter((o) => o.id !== oid) });

  const setCorrect = (oid: string) =>
    onChange({
      options: question.options.map((o) => ({ ...o, correct: o.id === oid })),
    });

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start gap-2">
        <Badge variant="secondary">Q{index + 1}</Badge>
        <Input
          value={question.prompt}
          onChange={(e) => onChange({ prompt: e.target.value })}
          placeholder="Question prompt"
        />
        <select
          value={question.type}
          onChange={(e) => onChange({ type: e.target.value as QuizQuestion["type"] })}
          className="h-9 rounded-md border bg-background px-2 text-xs"
        >
          <option value="single">Single choice</option>
          <option value="true_false">True / False</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          className="text-rose-600 hover:text-rose-600"
          aria-label="Delete question"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-3 space-y-2">
        {question.options.map((o) => (
          <div key={o.id} className="flex items-center gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={`correct-${question.id}`}
                checked={!!o.correct}
                onChange={() => setCorrect(o.id)}
                className="h-4 w-4 accent-primary"
                aria-label="Mark correct"
              />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Correct
              </span>
            </label>
            <Input
              value={o.label}
              onChange={(e) => updateOption(o.id, { label: e.target.value })}
              className="flex-1"
            />
            {question.options.length > 2 && (
              <button
                type="button"
                onClick={() => deleteOption(o.id)}
                className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-rose-500"
                aria-label="Remove option"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
        <Button variant="ghost" size="sm" onClick={addOption}>
          <Plus className="h-3 w-3" /> Add option
        </Button>
      </div>

      <div className="mt-3">
        <Label className="text-xs">Answer explanation</Label>
        <textarea
          value={question.explanation ?? ""}
          onChange={(e) => onChange({ explanation: e.target.value })}
          className="mt-1 min-h-[64px] w-full rounded-md border bg-background p-2 text-xs"
          placeholder="Shown after the learner submits, regardless of whether they got it right."
        />
      </div>
    </div>
  );
}

// ============================================================================
// Settings drawer (right)
// ============================================================================

function CourseSettings({
  draft,
  setDraft,
}: {
  draft: DraftCourse;
  setDraft: React.Dispatch<React.SetStateAction<DraftCourse>>;
}) {
  const addTo = (key: "learningObjectives" | "references") => {
    setDraft((d) => ({ ...d, [key]: [...(d[key] ?? []), "New item"] }));
  };
  const updateAt = (
    key: "learningObjectives" | "references",
    i: number,
    value: string
  ) => {
    setDraft((d) => {
      const arr = [...(d[key] ?? [])];
      arr[i] = value;
      return { ...d, [key]: arr };
    });
  };
  const removeAt = (key: "learningObjectives" | "references", i: number) => {
    setDraft((d) => ({
      ...d,
      [key]: (d[key] ?? []).filter((_, idx) => idx !== i),
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Settings className="h-3 w-3" /> Course settings
      </div>

      <div>
        <Label>Summary</Label>
        <textarea
          value={draft.summary}
          onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
          className="mt-1 min-h-[64px] w-full rounded-md border bg-background p-2 text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Category</Label>
          <Input
            value={draft.category}
            onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
            className="mt-1 h-8 text-xs"
          />
        </div>
        <div>
          <Label className="text-xs">Duration (min)</Label>
          <Input
            type="number"
            min={1}
            value={draft.durationMinutes}
            onChange={(e) =>
              setDraft((d) => ({ ...d, durationMinutes: Number(e.target.value) || 1 }))
            }
            className="mt-1 h-8 text-xs"
          />
        </div>
      </div>

      <div>
        <Label className="text-xs">Tags (comma-separated)</Label>
        <Input
          value={draft.tags.join(", ")}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              tags: e.target.value
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            }))
          }
          className="mt-1 h-8 text-xs"
        />
      </div>

      <RowSwitch
        title="Required"
        sub="Counts toward mandatory compliance"
        checked={draft.required}
        onCheckedChange={(v) => setDraft((d) => ({ ...d, required: v }))}
      />
      <RowSwitch
        title="Certificate on completion"
        sub="Issues a renewable credential"
        checked={draft.certificateEnabled}
        onCheckedChange={(v) => setDraft((d) => ({ ...d, certificateEnabled: v }))}
      />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium">Renewal (months)</div>
          <div className="text-[11px] text-muted-foreground">Blank = one-time course</div>
        </div>
        <Input
          type="number"
          min={0}
          max={120}
          value={draft.renewalMonths ?? 0}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              renewalMonths: Number(e.target.value) || null,
            }))
          }
          className="h-8 w-20"
        />
      </div>
      <RowSwitch
        title="Share to organization"
        sub="Usable in org-wide paths"
        checked={!!draft.shareToOrg}
        onCheckedChange={(v) => setDraft((d) => ({ ...d, shareToOrg: v }))}
      />

      <div className="rounded-lg border bg-muted/20 p-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Retake policy
        </div>
        <div className="space-y-1.5 text-xs">
          {([
            ["review_only", "Review only"],
            ["window_only", "Retake in renewal window"],
            ["anytime", "Retake anytime"],
          ] as const).map(([value, label]) => (
            <label key={value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="retake-policy"
                checked={draft.retakePolicy === value}
                onChange={() => setDraft((d) => ({ ...d, retakePolicy: value }))}
                className="h-3.5 w-3.5 accent-primary"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        {draft.retakePolicy === "window_only" && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Window (days before expiry)</span>
            <Input
              type="number"
              min={1}
              max={365}
              value={draft.retakeWindowDays ?? 30}
              onChange={(e) =>
                setDraft((d) => ({ ...d, retakeWindowDays: Number(e.target.value) || 30 }))
              }
              className="h-7 w-16"
            />
          </div>
        )}
      </div>

      <div>
        <Label className="text-xs">Overview</Label>
        <textarea
          value={draft.overview ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, overview: e.target.value }))}
          className="mt-1 min-h-[80px] w-full rounded-md border bg-background p-2 text-xs"
          placeholder="Shown on the course landing page before the first module."
        />
      </div>

      <div>
        <Label className="text-xs">Learning objectives</Label>
        <div className="mt-1 space-y-1.5">
          {(draft.learningObjectives ?? []).map((obj, i) => (
            <div key={i} className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <Input
                value={obj}
                onChange={(e) => updateAt("learningObjectives", i, e.target.value)}
                className="h-7 flex-1 text-xs"
              />
              <button
                type="button"
                onClick={() => removeAt("learningObjectives", i)}
                className="rounded p-1 text-muted-foreground hover:text-rose-500"
                aria-label="Remove objective"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={() => addTo("learningObjectives")}>
            <Plus className="h-3 w-3" /> Add objective
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-xs">References</Label>
        <div className="mt-1 space-y-1.5">
          {(draft.references ?? []).map((r, i) => (
            <div key={i} className="flex items-center gap-1">
              <Input
                value={r}
                onChange={(e) => updateAt("references", i, e.target.value)}
                className="h-7 flex-1 text-xs"
              />
              <button
                type="button"
                onClick={() => removeAt("references", i)}
                className="rounded p-1 text-muted-foreground hover:text-rose-500"
                aria-label="Remove reference"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
          <Button variant="ghost" size="sm" onClick={() => addTo("references")}>
            <Plus className="h-3 w-3" /> Add reference
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-gradient-to-br from-violet-500/5 to-primary/5 p-3">
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
          <Brain className="h-3 w-3" /> AI context
        </div>
        <textarea
          value={draft.aiContext ?? ""}
          onChange={(e) => setDraft((d) => ({ ...d, aiContext: e.target.value }))}
          className="min-h-[80px] w-full rounded-md border bg-background p-2 text-xs"
          placeholder="Describe who should take this course — titles, departments, duties. Used by the AI assignment engine."
        />
      </div>
    </div>
  );
}

function RowSwitch({
  title,
  sub,
  checked,
  onCheckedChange,
}: {
  title: string;
  sub: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ============================================================================
// Preview pane
// ============================================================================

function CoursePreviewPane({ draft }: { draft: DraftCourse }) {
  const [active, setActive] = React.useState<string>(draft.modules[0]?.id ?? "");
  const m = draft.modules.find((x) => x.id === active) ?? draft.modules[0];
  if (!m) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        Add a module to preview.
      </div>
    );
  }
  const Icon = MODULE_ICON[m.type];
  return (
    <div className="mx-auto max-w-3xl space-y-5 p-6">
      <div className="rounded-xl border bg-card p-5">
        <Badge variant="outline" className="mb-2">{draft.category || "Course"}</Badge>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{draft.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{draft.summary}</p>
      </div>
      {draft.overview && (
        <div className="rounded-xl border bg-card p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Overview
          </div>
          <p className="mt-1 text-sm">{draft.overview}</p>
        </div>
      )}
      {draft.learningObjectives && draft.learningObjectives.length > 0 && (
        <div className="rounded-xl border bg-card p-5">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            What you&rsquo;ll learn
          </div>
          <ul className="mt-2 space-y-1.5 text-sm">
            {draft.learningObjectives.map((o, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-1">
        {draft.modules.map((mod, i) => (
          <button
            key={mod.id}
            onClick={() => setActive(mod.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] transition",
              mod.id === active
                ? "border-primary bg-primary text-primary-foreground"
                : "hover:border-primary/40"
            )}
          >
            {i + 1}. {MODULE_LABEL[mod.type]}
          </button>
        ))}
      </div>
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {MODULE_LABEL[m.type]}
              {m.durationMinutes ? ` · ${m.durationMinutes} min` : ""}
            </div>
            <div className="mt-0.5 font-display text-xl font-semibold tracking-tight">
              {m.title}
            </div>
          </div>
        </div>

        {m.type === "video" && (
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/40 backdrop-blur">
                <PlayCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        )}

        {m.type === "quiz" && m.questions && m.questions.length > 0 ? (
          <QuizRunner questions={m.questions} />
        ) : m.body ? (
          <LessonProse body={m.body} />
        ) : null}
      </div>
    </div>
  );
}

// ============================================================================
// Draft shape + helpers
// ============================================================================

interface DraftCourse {
  id: string;
  title: string;
  summary: string;
  description: string;
  category: string;
  tags: string[];
  durationMinutes: number;
  required: boolean;
  renewalMonths: number | null;
  certificateEnabled: boolean;
  shareToOrg: boolean;
  aiContext: string;
  retakePolicy: "review_only" | "window_only" | "anytime";
  retakeWindowDays: number;
  learningObjectives: string[];
  overview: string;
  references: string[];
  published: boolean;
  modules: CourseModule[];
}

function cloneDraft(course: Course): DraftCourse {
  return {
    id: course.id,
    title: course.title,
    summary: course.summary,
    description: course.description,
    category: course.category,
    tags: [...course.tags],
    durationMinutes: course.durationMinutes,
    required: course.required,
    renewalMonths: course.renewalMonths ?? null,
    certificateEnabled: course.certificateEnabled,
    shareToOrg: !!course.shareToOrg,
    aiContext: course.aiContext ?? "",
    retakePolicy: course.retakePolicy ?? "window_only",
    retakeWindowDays: course.retakeWindowDays ?? 30,
    learningObjectives: [...(course.learningObjectives ?? [])],
    overview: course.overview ?? "",
    references: [...(course.references ?? [])],
    published: course.published,
    modules: (course.modules ?? []).map((m) => ({
      ...m,
      questions: m.questions?.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ ...o })),
      })),
    })),
  };
}
