"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Bold,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Eye,
  FileText,
  GripVertical,
  Heading,
  HelpCircle,
  Image as ImageIcon,
  Info,
  List,
  ListChecks,
  ListOrdered,
  PlayCircle,
  Plus,
  Quote,
  Save,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Table as TableIcon,
  Trash2,
  Undo2,
  Video,
  Wand2,
  X,
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
import { useKeyboardShortcut } from "@/lib/hooks";
import {
  GENERIC_TEMPLATES,
  LESSON_TEMPLATES,
  QUIZ_TEMPLATES,
  generateQuizFromLesson,
} from "@/lib/course-builder/templates";
import { validateDraft, type BuilderIssue } from "@/lib/course-builder/validation";
import { EMOJI_PRESETS, GRADIENT_PRESETS } from "@/lib/course-builder/thumbnail";

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
  const [savedSnapshot, setSavedSnapshot] = React.useState<DraftCourse>(() => cloneDraft(course));
  const [draft, setDraft] = React.useState<DraftCourse>(() => cloneDraft(course));
  const [pending, startTransition] = React.useTransition();
  const [activeModuleId, setActiveModuleId] = React.useState<string | null>(
    draft.modules[0]?.id ?? null
  );
  const [preview, setPreview] = React.useState(false);
  const [autosaveOn, setAutosaveOn] = React.useState(true);
  const [lastSavedAt, setLastSavedAt] = React.useState<number | null>(null);
  const [validationOpen, setValidationOpen] = React.useState(false);

  // Mark dirty by deep-compare of stable shape — cheap for this size.
  const dirty = React.useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(savedSnapshot),
    [draft, savedSnapshot]
  );

  const activeModule =
    draft.modules.find((m) => m.id === activeModuleId) ?? draft.modules[0] ?? null;

  // --------- Validation ---------
  const issues = React.useMemo(() => validateDraft(draft), [draft]);
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warnCount = issues.filter((i) => i.severity === "warning").length;
  const canPublish = errorCount === 0;

  // --------- Duration reconciliation ---------
  const moduleMinutes = draft.modules.reduce((s, m) => s + (m.durationMinutes ?? 0), 0);

  // --------- Mutations ---------
  const save = React.useCallback(
    (opts: { publish?: boolean; silent?: boolean } = {}) => {
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
          thumbnailColor: draft.thumbnailColor,
          thumbnailEmoji: draft.thumbnailEmoji,
        });
        if (res.ok) {
          const nextDraft = opts.publish ? { ...draft, published: true } : draft;
          setSavedSnapshot(cloneDraft(toCourseShape(nextDraft, course)));
          setDraft(nextDraft);
          setLastSavedAt(Date.now());
          if (!opts.silent) {
            toast({
              title: opts.publish ? "Course published" : "Course saved",
              description: `${draft.title} · ${draft.modules.length} module${
                draft.modules.length === 1 ? "" : "s"
              }`,
              variant: "success",
            });
          }
          router.refresh();
        } else if (!opts.silent) {
          toast({ title: "Save failed", description: res.error, variant: "error" });
        }
      });
    },
    [draft, router, toast, course]
  );

  const revert = () => {
    setDraft(savedSnapshot);
    toast({ title: "Reverted to last saved", variant: "default" });
  };

  // --------- Autosave ---------
  React.useEffect(() => {
    if (!autosaveOn || !dirty || pending) return;
    const t = setTimeout(() => save({ silent: true }), 3500);
    return () => clearTimeout(t);
  }, [autosaveOn, dirty, pending, save]);

  // --------- Keyboard shortcuts ---------
  useKeyboardShortcut("s", (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (!meta) return;
    e.preventDefault();
    if (dirty) save();
  }, { mod: true });
  useKeyboardShortcut("p", (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (!meta) return;
    e.preventDefault();
    setPreview((p) => !p);
  }, { mod: true });

  // --------- Module operations ---------
  const addModuleFromTemplate = (mod: CourseModule) => {
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

  const moveModuleToIndex = (id: string, target: number) => {
    setDraft((d) => {
      const idx = d.modules.findIndex((m) => m.id === id);
      if (idx < 0) return d;
      const next = [...d.modules];
      const [m] = next.splice(idx, 1);
      const clamp = Math.max(0, Math.min(next.length, target));
      next.splice(clamp, 0, m);
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
          <SaveStatus dirty={dirty} saving={pending} lastSavedAt={lastSavedAt} />
          <ValidationBadge
            errorCount={errorCount}
            warnCount={warnCount}
            onClick={() => setValidationOpen(true)}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={autosaveOn}
              onChange={(e) => setAutosaveOn(e.target.checked)}
              className="h-3 w-3 accent-primary"
            />
            Autosave
          </label>
          <Button variant="outline" size="sm" onClick={() => setPreview((p) => !p)}>
            <Eye className="h-3.5 w-3.5" />
            {preview ? "Back to editor" : "Preview"}
            <kbd className="ml-1 hidden rounded border bg-muted px-1 font-mono text-[9px] md:inline">⌘P</kbd>
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
            <kbd className="ml-1 hidden rounded border bg-primary/20 px-1 font-mono text-[9px] md:inline">⌘S</kbd>
          </Button>
          {!draft.published && (
            <Button
              size="sm"
              onClick={() => {
                if (!canPublish) {
                  setValidationOpen(true);
                  toast({
                    title: "Can't publish yet",
                    description: `${errorCount} error${errorCount === 1 ? "" : "s"} must be fixed first.`,
                    variant: "error",
                  });
                  return;
                }
                save({ publish: true });
              }}
              disabled={pending}
            >
              <Send className="h-3.5 w-3.5" /> Publish
            </Button>
          )}
        </div>
      </div>

      {validationOpen && (
        <ValidationPanel
          issues={issues}
          onClose={() => setValidationOpen(false)}
          onJumpTo={(issue) => {
            if (issue.moduleId) setActiveModuleId(issue.moduleId);
            setValidationOpen(false);
          }}
        />
      )}

      {preview ? (
        <CoursePreviewPane draft={draft} />
      ) : (
        <div className="grid flex-1 grid-cols-1 gap-0 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
          {/* Left — module list */}
          <aside className="border-b bg-muted/20 lg:border-b-0 lg:border-r">
            <div className="flex items-center justify-between border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Structure · {draft.modules.length}</span>
              <span>{moduleMinutes}m</span>
            </div>
            <ModuleList
              modules={draft.modules}
              activeId={activeModuleId}
              onSelect={setActiveModuleId}
              onMove={moveModuleToIndex}
              onReorderArrow={moveModule}
            />
            <div className="px-2 pb-2">
              <AddModuleMenu onAdd={addModuleFromTemplate} />
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
                modules={draft.modules}
                onChange={(patch) => updateModule(activeModule.id, patch)}
                onDuplicate={() => duplicateModule(activeModule.id)}
                onDelete={() => deleteModule(activeModule.id)}
                onAddQuestion={() => addQuestion(activeModule.id)}
                onUpdateQuestion={(qid, patch) => updateQuestion(activeModule.id, qid, patch)}
                onDeleteQuestion={(qid) => deleteQuestion(activeModule.id, qid)}
                onAppendQuestions={(qs) => {
                  updateModule(activeModule.id, {
                    questions: [...(activeModule.questions ?? []), ...qs],
                  });
                }}
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
  modules,
  onChange,
  onDuplicate,
  onDelete,
  onAddQuestion,
  onUpdateQuestion,
  onDeleteQuestion,
  onAppendQuestions,
}: {
  module: CourseModule;
  modules: CourseModule[];
  onChange: (patch: Partial<CourseModule>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddQuestion: () => void;
  onUpdateQuestion: (qid: string, patch: Partial<QuizQuestion>) => void;
  onDeleteQuestion: (qid: string) => void;
  onAppendQuestions: (qs: QuizQuestion[]) => void;
}) {
  const { toast } = useToast();
  const bodyRef = React.useRef<HTMLTextAreaElement>(null);
  const onBodyKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === "b") {
      e.preventDefault();
      const el = bodyRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const v = m.body ?? "";
      const sel = v.slice(start, end) || "text";
      onChange({ body: v.slice(0, start) + `**${sel}**` + v.slice(end) });
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(start + 2, start + 2 + sel.length);
      });
    }
  };

  const previousLessonBody = React.useMemo(() => {
    const idx = modules.findIndex((x) => x.id === m.id);
    for (let i = idx - 1; i >= 0; i--) {
      if (modules[i].type === "lesson" && modules[i].body) return modules[i].body ?? "";
    }
    return "";
  }, [modules, m.id]);

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
            <div className="rounded-lg border">
              <RichTextToolbar
                textareaRef={bodyRef}
                value={m.body ?? ""}
                onChange={(v) => onChange({ body: v })}
              />
              <textarea
                ref={bodyRef}
                value={m.body ?? ""}
                onChange={(e) => onChange({ body: e.target.value })}
                onKeyDown={onBodyKeyDown}
                className="min-h-[340px] w-full rounded-b-lg border-t bg-background p-3 font-mono text-xs leading-relaxed focus:outline-none"
                placeholder={
                  "## Heading\n\nParagraph text. Use **bold**, - bullets, 1. numbered, > quotes."
                }
              />
            </div>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Markdown-ish: <code>##</code>/<code>###</code> headings, <code>-</code>/
              <code>*</code> bullets, <code>1.</code> numbered, <code>&gt;</code> quotes,{" "}
              <code>**bold**</code> (<kbd className="rounded border bg-muted px-1 font-mono text-[9px]">⌘B</kbd>),
              pipe tables.
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!previousLessonBody}
                onClick={() => {
                  const drafts = generateQuizFromLesson(previousLessonBody, 3);
                  onAppendQuestions(drafts);
                  toast({
                    title: "Generated 3 draft questions",
                    description:
                      "AI placeholder — edit the prompts and answers to match your lesson.",
                    variant: "success",
                  });
                }}
                title={
                  previousLessonBody
                    ? "Generate 3 draft questions from the most recent lesson body above"
                    : "Add a lesson module above first to generate questions"
                }
              >
                <Wand2 className="h-3.5 w-3.5" /> Generate from lesson
              </Button>
              <Button variant="outline" size="sm" onClick={onAddQuestion}>
                <Plus className="h-3.5 w-3.5" /> Add question
              </Button>
            </div>
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

      <ThumbnailPicker
        gradient={draft.thumbnailColor}
        emoji={draft.thumbnailEmoji}
        onChange={(color, emoji) =>
          setDraft((d) => ({
            ...d,
            thumbnailColor: color ?? d.thumbnailColor,
            thumbnailEmoji: emoji ?? d.thumbnailEmoji,
          }))
        }
      />

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
  thumbnailColor: string;
  thumbnailEmoji: string;
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
    thumbnailColor: course.thumbnailColor,
    thumbnailEmoji: course.thumbnailEmoji,
    modules: (course.modules ?? []).map((m) => ({
      ...m,
      questions: m.questions?.map((q) => ({
        ...q,
        options: q.options.map((o) => ({ ...o })),
      })),
    })),
  };
}

/** Folds a DraftCourse back into Course shape for re-cloning. */
function toCourseShape(d: DraftCourse, base: Course): Course {
  return {
    ...base,
    title: d.title,
    summary: d.summary,
    description: d.description,
    category: d.category,
    tags: d.tags,
    durationMinutes: d.durationMinutes,
    required: d.required,
    renewalMonths: d.renewalMonths ?? undefined,
    certificateEnabled: d.certificateEnabled,
    shareToOrg: d.shareToOrg,
    aiContext: d.aiContext,
    retakePolicy: d.retakePolicy,
    retakeWindowDays: d.retakeWindowDays,
    learningObjectives: d.learningObjectives,
    overview: d.overview,
    references: d.references,
    published: d.published,
    thumbnailColor: d.thumbnailColor,
    thumbnailEmoji: d.thumbnailEmoji,
    modules: d.modules,
  };
}

// ============================================================================
// Save status indicator
// ============================================================================

function SaveStatus({
  dirty,
  saving,
  lastSavedAt,
}: {
  dirty: boolean;
  saving: boolean;
  lastSavedAt: number | null;
}) {
  const [, tick] = React.useReducer((n: number) => n + 1, 0);
  React.useEffect(() => {
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        Saving…
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Unsaved changes
      </span>
    );
  }
  if (lastSavedAt) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
        Saved {relTime(lastSavedAt)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <CheckCircle2 className="h-3 w-3 text-emerald-500" />
      All caught up
    </span>
  );
}

function relTime(ts: number): string {
  const diff = Math.max(0, Date.now() - ts);
  if (diff < 10_000) return "just now";
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  return `${Math.floor(diff / 3_600_000)}h ago`;
}

// ============================================================================
// Validation badge + panel
// ============================================================================

function ValidationBadge({
  errorCount,
  warnCount,
  onClick,
}: {
  errorCount: number;
  warnCount: number;
  onClick: () => void;
}) {
  if (errorCount === 0 && warnCount === 0) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 rounded-full border bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300"
      >
        <CheckCircle2 className="h-3 w-3" /> No issues
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
        errorCount > 0
          ? "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
      )}
    >
      <AlertTriangle className="h-3 w-3" />
      {errorCount > 0 && `${errorCount} error${errorCount === 1 ? "" : "s"}`}
      {errorCount > 0 && warnCount > 0 && " · "}
      {warnCount > 0 && `${warnCount} warning${warnCount === 1 ? "" : "s"}`}
    </button>
  );
}

function ValidationPanel({
  issues,
  onClose,
  onJumpTo,
}: {
  issues: BuilderIssue[];
  onClose: () => void;
  onJumpTo: (issue: BuilderIssue) => void;
}) {
  if (issues.length === 0) return null;
  return (
    <div className="border-b bg-amber-500/5">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-800 dark:text-amber-200">
          Review · {issues.length}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <ul className="divide-y">
        {issues.map((i) => (
          <li key={i.id}>
            <button
              type="button"
              onClick={() => onJumpTo(i)}
              className="flex w-full items-start gap-2 px-4 py-2 text-left text-xs hover:bg-accent/40"
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold uppercase text-white",
                  i.severity === "error"
                    ? "bg-rose-500"
                    : i.severity === "warning"
                    ? "bg-amber-500"
                    : "bg-sky-500"
                )}
              >
                {i.severity[0]}
              </span>
              <span className="flex-1">{i.message}</span>
              {i.moduleId && (
                <span className="text-[10px] text-muted-foreground">Jump →</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ============================================================================
// Module list with native HTML5 drag-and-drop
// ============================================================================

function ModuleList({
  modules,
  activeId,
  onSelect,
  onMove,
  onReorderArrow,
}: {
  modules: CourseModule[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, targetIndex: number) => void;
  onReorderArrow: (id: string, dir: -1 | 1) => void;
}) {
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  const handleDrop = (targetIndex: number) => {
    if (!dragId) return;
    onMove(dragId, targetIndex);
    setDragId(null);
    setOverIndex(null);
  };

  return (
    <ol className="space-y-1 p-2">
      {modules.map((m, i) => {
        const Icon = MODULE_ICON[m.type];
        const isActive = m.id === activeId;
        const isDragging = dragId === m.id;
        const isDropTarget = overIndex === i && dragId !== null && dragId !== m.id;
        return (
          <li key={m.id}>
            {isDropTarget && (
              <div
                aria-hidden
                className="mb-1 h-0.5 w-full rounded-full bg-primary"
              />
            )}
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", m.id);
                setDragId(m.id);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOverIndex(i);
              }}
              onDragLeave={() => setOverIndex((cur) => (cur === i ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(i);
              }}
              onDragEnd={() => {
                setDragId(null);
                setOverIndex(null);
              }}
            >
              <button
                type="button"
                onClick={() => onSelect(m.id)}
                className={cn(
                  "group flex w-full items-start gap-2 rounded-md border bg-background px-2 py-2 text-left transition",
                  isActive && "border-primary/60 bg-primary/5 shadow-sm",
                  !isActive && "hover:border-primary/30",
                  isDragging && "opacity-50"
                )}
              >
                <span
                  className="flex h-full cursor-grab items-start pt-0.5 text-muted-foreground/60"
                  aria-label="Drag handle"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </span>
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
                      onReorderArrow(m.id, -1);
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
                      onReorderArrow(m.id, 1);
                    }}
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </span>
              </button>
            </div>
          </li>
        );
      })}
      {/* Final drop target — append to end */}
      <li
        onDragOver={(e) => {
          if (!dragId) return;
          e.preventDefault();
          setOverIndex(modules.length);
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleDrop(modules.length);
        }}
        className={cn("h-3 rounded", overIndex === modules.length && "bg-primary/30")}
      />
    </ol>
  );
}

// ============================================================================
// Add-module menu with templates
// ============================================================================

function AddModuleMenu({ onAdd }: { onAdd: (mod: CourseModule) => void }) {
  const [open, setOpen] = React.useState<"lesson" | "quiz" | null>(null);
  return (
    <div>
      <div className="mb-1 mt-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        + Add module
      </div>
      <TypeButton
        label="Lesson"
        icon={FileText}
        expanded={open === "lesson"}
        onExpand={() => setOpen(open === "lesson" ? null : "lesson")}
      >
        <TemplateList templates={LESSON_TEMPLATES} onPick={(t) => { onAdd(t.make()); setOpen(null); }} />
      </TypeButton>
      <TypeButton
        label="Quiz"
        icon={HelpCircle}
        expanded={open === "quiz"}
        onExpand={() => setOpen(open === "quiz" ? null : "quiz")}
      >
        <TemplateList templates={QUIZ_TEMPLATES} onPick={(t) => { onAdd(t.make()); setOpen(null); }} />
      </TypeButton>
      {(
        [
          ["video", Video],
          ["checkpoint", ListChecks],
          ["attestation", ShieldCheck],
          ["file", ClipboardCheck],
        ] as Array<[CourseModule["type"], React.ComponentType<{ className?: string }>]>
      ).map(([t, Icon]) => (
        <button
          key={t}
          type="button"
          onClick={() => {
            const tmpl = GENERIC_TEMPLATES[t];
            if (tmpl) onAdd(tmpl.make());
          }}
          className="mt-1 flex w-full items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-left text-xs transition hover:border-primary/40"
        >
          <Icon className="h-3.5 w-3.5 text-primary" />
          <span className="flex-1 capitalize">{t.replace("_", " ")}</span>
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
}

function TypeButton({
  label,
  icon: Icon,
  expanded,
  onExpand,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
  onExpand: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-1">
      <button
        type="button"
        onClick={onExpand}
        className={cn(
          "flex w-full items-center gap-2 rounded-md border bg-background px-2 py-1.5 text-left text-xs transition hover:border-primary/40",
          expanded && "border-primary/40 bg-primary/5"
        )}
      >
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="flex-1">{label}</span>
        <Plus className={cn("h-3 w-3 text-muted-foreground transition", expanded && "rotate-45")} />
      </button>
      {expanded && <div className="mt-1 space-y-1 pl-3">{children}</div>}
    </div>
  );
}

function TemplateList({
  templates,
  onPick,
}: {
  templates: { id: string; label: string; description: string; make: () => CourseModule }[];
  onPick: (t: { id: string; label: string; description: string; make: () => CourseModule }) => void;
}) {
  return (
    <>
      {templates.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onPick(t)}
          className="flex w-full flex-col items-start gap-0.5 rounded-md border bg-background px-2 py-1.5 text-left text-[11px] transition hover:border-primary/40"
        >
          <span className="font-medium">{t.label}</span>
          <span className="text-[10px] text-muted-foreground">{t.description}</span>
        </button>
      ))}
    </>
  );
}

// ============================================================================
// Rich-text toolbar (acts on a textarea selection, inserts markdown tokens)
// ============================================================================

export function RichTextToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
}) {
  const wrap = (prefix: string, suffix: string = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const sel = value.slice(start, end) || "text";
    const next = value.slice(0, start) + prefix + sel + suffix + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + sel.length);
    });
  };

  const prefixLine = (p: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const before = value.slice(0, start);
    const sel = value.slice(start, end);
    const after = value.slice(end);
    const lineStart = before.lastIndexOf("\n") + 1;
    const lines = (sel || "item").split("\n");
    const prefixed = lines.map((l) => `${p}${l}`).join("\n");
    const next = value.slice(0, lineStart) + prefixed + after;
    onChange(next);
    requestAnimationFrame(() => el.focus());
  };

  const insertBlock = (block: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const next = value.slice(0, start) + (start > 0 && value[start - 1] !== "\n" ? "\n\n" : "") + block + "\n";
    onChange(next);
    requestAnimationFrame(() => el.focus());
  };

  const buttons: Array<[React.ComponentType<{ className?: string }>, string, () => void]> = [
    [Heading, "H2", () => prefixLine("## ")],
    [Heading, "H3", () => prefixLine("### ")],
    [Bold, "Bold (⌘B)", () => wrap("**")],
    [List, "Bullets", () => prefixLine("- ")],
    [ListOrdered, "Numbered", () => prefixLine("1. ")],
    [Quote, "Quote", () => prefixLine("> ")],
    [TableIcon, "Table", () =>
      insertBlock("| Column A | Column B |\n| --- | --- |\n| Row 1 | Row 1 |\n| Row 2 | Row 2 |")],
    [ImageIcon, "Image", () => insertBlock("![alt text](https://…)")],
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 bg-muted/40 px-1 py-1">
      {buttons.map(([Icon, label, fn]) => (
        <button
          key={label}
          type="button"
          title={label}
          onClick={fn}
          className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1.5 text-xs text-muted-foreground transition hover:bg-background hover:text-foreground"
        >
          <Icon className="h-3.5 w-3.5" />
          {label.startsWith("H") && <span className="ml-0.5 font-bold">{label.slice(1)}</span>}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// Thumbnail picker (gradient + emoji)
// ============================================================================

function ThumbnailPicker({
  gradient,
  emoji,
  onChange,
}: {
  gradient: string;
  emoji: string;
  onChange: (gradient?: string, emoji?: string) => void;
}) {
  const [open, setOpen] = React.useState<"gradient" | "emoji" | null>(null);
  return (
    <div>
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Thumbnail
      </div>
      <button
        type="button"
        onClick={() => setOpen(open === "gradient" ? null : "gradient")}
        className={cn(
          "relative flex h-20 w-full items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br text-5xl text-white shadow transition hover:ring-2 hover:ring-primary/30",
          gradient
        )}
      >
        <span aria-hidden className="absolute inset-0 bg-star-field opacity-40" />
        <span className="relative drop-shadow">{emoji}</span>
      </button>
      {open === "gradient" && (
        <div className="mt-2 grid grid-cols-7 gap-1">
          {GRADIENT_PRESETS.map((p) => (
            <button
              key={p.className}
              type="button"
              title={p.label}
              onClick={() => onChange(p.className, undefined)}
              className={cn(
                "h-7 w-full rounded-md bg-gradient-to-br ring-1 ring-inset ring-border transition",
                p.className,
                gradient === p.className && "ring-2 ring-primary"
              )}
            />
          ))}
        </div>
      )}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Emoji</span>
        <button
          type="button"
          onClick={() => setOpen(open === "emoji" ? null : "emoji")}
          className="flex h-8 w-8 items-center justify-center rounded-md border bg-background text-base hover:border-primary/40"
        >
          {emoji}
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === "gradient" ? null : "gradient")}
          className="text-[10px] text-muted-foreground hover:text-foreground"
        >
          Change gradient
        </button>
      </div>
      {open === "emoji" && (
        <div className="mt-2 grid grid-cols-8 gap-1 rounded-md border bg-background p-2">
          {EMOJI_PRESETS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onChange(undefined, e)}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md text-base transition hover:bg-muted",
                emoji === e && "bg-primary/10 ring-2 ring-primary/40"
              )}
            >
              {e}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
