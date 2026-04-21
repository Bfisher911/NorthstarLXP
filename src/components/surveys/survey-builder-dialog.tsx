"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, FileCheck2, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { createSurvey, updateSurvey } from "@/app/actions/mutations";
import { cn } from "@/lib/utils";

interface OptionRow {
  id: string;
  label: string;
  triggersCourseId?: string | null;
}

interface QuestionRow {
  id: string;
  prompt: string;
  options: OptionRow[];
}

export interface SurveyDraft {
  id?: string;
  title: string;
  description: string;
  schedule: "on_hire" | "annual" | "quarterly" | "manual";
  published: boolean;
  questions: QuestionRow[];
}

interface Course {
  id: string;
  title: string;
}

export function SurveyBuilderDialog({
  orgId,
  workspaceId,
  courses,
  existing,
  trigger,
}: {
  orgId: string;
  workspaceId: string;
  courses: Course[];
  existing?: SurveyDraft;
  trigger: React.ReactNode;
}) {
  const isEdit = !!existing?.id;
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<SurveyDraft>(
    existing ?? {
      title: "",
      description: "",
      schedule: "annual",
      published: false,
      questions: [
        {
          id: newId(),
          prompt: "",
          options: [
            { id: newId(), label: "Yes" },
            { id: newId(), label: "No" },
          ],
        },
      ],
    }
  );
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  function newId() {
    return Math.random().toString(36).slice(2, 10);
  }

  const addQuestion = () =>
    setDraft((d) => ({
      ...d,
      questions: [
        ...d.questions,
        {
          id: newId(),
          prompt: "",
          options: [
            { id: newId(), label: "Yes" },
            { id: newId(), label: "No" },
          ],
        },
      ],
    }));

  const removeQuestion = (qid: string) =>
    setDraft((d) => ({ ...d, questions: d.questions.filter((q) => q.id !== qid) }));

  const updateQuestion = (qid: string, patch: Partial<QuestionRow>) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
    }));

  const addOption = (qid: string) =>
    updateQuestion(qid, {
      options: [
        ...draft.questions.find((q) => q.id === qid)!.options,
        { id: newId(), label: "New option" },
      ],
    });

  const updateOption = (qid: string, oid: string, patch: Partial<OptionRow>) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q) =>
        q.id !== qid
          ? q
          : {
              ...q,
              options: q.options.map((o) => (o.id === oid ? { ...o, ...patch } : o)),
            }
      ),
    }));

  const removeOption = (qid: string, oid: string) =>
    setDraft((d) => ({
      ...d,
      questions: d.questions.map((q) =>
        q.id !== qid ? q : { ...q, options: q.options.filter((o) => o.id !== oid) }
      ),
    }));

  const canSave =
    draft.title.trim().length > 0 &&
    draft.questions.length > 0 &&
    draft.questions.every(
      (q) =>
        q.prompt.trim().length > 0 &&
        q.options.length >= 2 &&
        q.options.every((o) => o.label.trim().length > 0)
    );

  const submit = () => {
    startTransition(async () => {
      const res = isEdit
        ? await updateSurvey({
            surveyId: existing!.id!,
            title: draft.title,
            description: draft.description,
            schedule: draft.schedule,
            published: draft.published,
            questions: draft.questions,
          })
        : await createSurvey({
            orgId,
            workspaceId,
            title: draft.title,
            description: draft.description,
            schedule: draft.schedule,
            questions: draft.questions,
          });
      if (res.ok) {
        toast({
          title: isEdit ? "Survey updated" : "Survey created",
          description: draft.title,
          variant: "success",
        });
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-background/70 backdrop-blur data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] flex h-[90vh] w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
              {isEdit ? <Pencil className="h-4 w-4 text-primary" /> : <FileCheck2 className="h-4 w-4 text-primary" />}
              {isEdit ? "Edit survey" : "Create a survey"}
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-thin p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Title</Label>
                <Input
                  className="mt-1"
                  placeholder="e.g. Annual Safety Needs Assessment"
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Input
                  className="mt-1"
                  placeholder="What will this survey do?"
                  value={draft.description}
                  onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
                />
              </div>
              <div>
                <Label>Schedule</Label>
                <select
                  className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                  value={draft.schedule}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, schedule: e.target.value as SurveyDraft["schedule"] }))
                  }
                >
                  <option value="manual">Manual</option>
                  <option value="annual">Annual</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="on_hire">On hire</option>
                </select>
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1 flex h-9 items-center gap-2 rounded-md border px-3">
                  <input
                    id={`pub-${existing?.id ?? "new"}`}
                    type="checkbox"
                    checked={draft.published}
                    onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
                    className="h-4 w-4 accent-primary"
                  />
                  <label htmlFor={`pub-${existing?.id ?? "new"}`} className="text-xs text-muted-foreground">
                    Published (assignable to learners)
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {draft.questions.map((q, qi) => (
                <div key={q.id} className="rounded-xl border bg-card p-4">
                  <div className="mb-2 flex items-start gap-2">
                    <Badge variant="secondary">Q{qi + 1}</Badge>
                    <Input
                      placeholder="Question prompt"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                    />
                    {draft.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(q.id)}
                        className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-rose-500"
                        aria-label="Remove question"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((o) => (
                      <div key={o.id} className="grid items-center gap-2 md:grid-cols-[1fr_auto_auto]">
                        <Input
                          placeholder="Answer label"
                          value={o.label}
                          onChange={(e) => updateOption(q.id, o.id, { label: e.target.value })}
                        />
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <ArrowRight className="h-3 w-3" />
                          <select
                            className="h-8 rounded-md border bg-background px-2 text-xs"
                            value={o.triggersCourseId ?? ""}
                            onChange={(e) =>
                              updateOption(q.id, o.id, {
                                triggersCourseId: e.target.value || null,
                              })
                            }
                          >
                            <option value="">No trigger</option>
                            {courses.map((c) => (
                              <option key={c.id} value={c.id}>
                                Assign: {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => removeOption(q.id, o.id)}
                            className="rounded p-1.5 text-muted-foreground transition hover:bg-muted hover:text-rose-500"
                            aria-label="Remove option"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => addOption(q.id)}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add answer
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addQuestion}>
                <Plus className="h-3.5 w-3.5" /> Add question
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={!canSave || pending}
              className={cn(isEdit && "bg-primary")}
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create survey"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
