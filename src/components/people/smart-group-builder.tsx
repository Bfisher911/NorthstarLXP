"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Plus, Users, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { createSmartGroup, deleteSmartGroup, updateSmartGroup } from "@/app/actions/mutations";
import { cn, initials } from "@/lib/utils";
import type { SmartGroupCondition, UserRecord } from "@/lib/types";

const fields: Array<{ value: SmartGroupCondition["field"]; label: string }> = [
  { value: "title", label: "Title" },
  { value: "department", label: "Department" },
  { value: "division", label: "Division" },
  { value: "location", label: "Location" },
  { value: "campus", label: "Campus" },
  { value: "hire_date", label: "Hire date" },
  { value: "worker_type", label: "Worker type" },
  { value: "status", label: "Status" },
  { value: "manager", label: "Manager" },
  { value: "job_duties", label: "Job duties" },
];

const ops: Array<{ value: SmartGroupCondition["op"]; label: string }> = [
  { value: "equals", label: "equals" },
  { value: "contains", label: "contains" },
  { value: "in", label: "in" },
  { value: "after", label: "after" },
  { value: "before", label: "before" },
  { value: "starts_with", label: "starts with" },
];

function extract(u: UserRecord, field: SmartGroupCondition["field"]): string {
  const e = u.employee;
  switch (field) {
    case "title": return e?.title ?? "";
    case "department": return e?.department ?? "";
    case "division": return e?.division ?? "";
    case "location": return e?.location ?? "";
    case "campus": return e?.campus ?? "";
    case "hire_date": return e?.hireDate ?? "";
    case "worker_type": return e?.workerType ?? "";
    case "status": return e?.status ?? "";
    case "manager": return u.managerId ?? "";
    case "job_duties": return (e?.jobDuties ?? []).join(" · ");
    default: return "";
  }
}

function evaluate(u: UserRecord, c: SmartGroupCondition): boolean {
  const actual = extract(u, c.field).toLowerCase();
  const expected = String(c.value).toLowerCase();
  switch (c.op) {
    case "equals": return actual === expected;
    case "contains": return actual.includes(expected);
    case "in": return expected.split(",").map((x) => x.trim()).includes(actual);
    case "after": return new Date(actual).getTime() >= new Date(String(c.value)).getTime();
    case "before": return new Date(actual).getTime() <= new Date(String(c.value)).getTime();
    case "starts_with": return actual.startsWith(expected);
    default: return false;
  }
}

export interface SmartGroupDraft {
  id: string;
  name: string;
  description: string;
  conditions: SmartGroupCondition[];
}

export function SmartGroupBuilder({
  orgId,
  workspaceId,
  candidates,
  triggerLabel = "New group",
  existing,
  trigger,
}: {
  orgId: string;
  workspaceId?: string;
  candidates: UserRecord[];
  triggerLabel?: string;
  existing?: SmartGroupDraft;
  trigger?: React.ReactNode;
}) {
  const isEdit = !!existing?.id;
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState(existing?.name ?? "");
  const [description, setDescription] = React.useState(existing?.description ?? "");
  const [conditions, setConditions] = React.useState<SmartGroupCondition[]>(
    existing?.conditions ?? [{ field: "department", op: "equals", value: "" }]
  );
  const [pending, startTransition] = React.useTransition();
  const [deletePending, startDelete] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const matches = React.useMemo(() => {
    const valid = conditions.filter((c) => String(c.value).trim() !== "");
    if (valid.length === 0) return [] as UserRecord[];
    return candidates.filter((u) => valid.every((c) => evaluate(u, c)));
  }, [conditions, candidates]);

  const canSave = name.trim().length > 0 && matches.length > 0;

  const updateCondition = (i: number, patch: Partial<SmartGroupCondition>) =>
    setConditions((prev) => prev.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const addCondition = () =>
    setConditions((prev) => [...prev, { field: "title", op: "contains", value: "" }]);

  const removeCondition = (i: number) =>
    setConditions((prev) => prev.filter((_, idx) => idx !== i));

  const reset = () => {
    setName("");
    setDescription("");
    setConditions([{ field: "department", op: "equals", value: "" }]);
  };

  const save = () => {
    startTransition(async () => {
      const res = isEdit
        ? await updateSmartGroup({
            groupId: existing!.id,
            name: name.trim(),
            description: description.trim(),
            conditions,
            memberCount: matches.length,
          })
        : await createSmartGroup({
            orgId,
            workspaceId,
            name: name.trim(),
            description: description.trim(),
            conditions,
            memberCount: matches.length,
          });
      if (res.ok) {
        toast({
          title: isEdit ? "Smart group updated" : "Smart group created",
          description: `${name} matches ${matches.length} ${matches.length === 1 ? "person" : "people"}.`,
          variant: "success",
        });
        if (!isEdit) reset();
        setOpen(false);
        router.refresh();
      }
    });
  };

  const remove = () => {
    if (!isEdit) return;
    startDelete(async () => {
      const res = await deleteSmartGroup({ groupId: existing!.id });
      if (res.ok) {
        toast({ title: "Smart group deleted", variant: "default" });
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="h-4 w-4" /> {triggerLabel}
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-background/70 backdrop-blur data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[94vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-primary" />
              {isEdit ? "Edit smart group" : "Build a smart group"}
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="e.g. ICU Clinical Staff"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  placeholder="Why does this audience exist?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Conditions · all must match
                </div>
                <div className="space-y-2">
                  {conditions.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={c.field}
                        onChange={(e) => updateCondition(i, { field: e.target.value as SmartGroupCondition["field"] })}
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                      >
                        {fields.map((f) => (
                          <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                      </select>
                      <select
                        value={c.op}
                        onChange={(e) => updateCondition(i, { op: e.target.value as SmartGroupCondition["op"] })}
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                      >
                        {ops.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <Input
                        className="h-9 flex-1"
                        placeholder="value"
                        value={String(c.value ?? "")}
                        onChange={(e) => updateCondition(i, { value: e.target.value })}
                      />
                      <button
                        type="button"
                        onClick={() => removeCondition(i)}
                        className="rounded p-1 text-muted-foreground transition hover:bg-muted hover:text-rose-500"
                        aria-label="Remove condition"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" onClick={addCondition} className="mt-2">
                  <Plus className="h-3.5 w-3.5" /> Add condition
                </Button>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/20 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Live preview
                </div>
                <Badge variant="secondary">{matches.length} matched</Badge>
              </div>
              <div className="max-h-72 space-y-1.5 overflow-y-auto scrollbar-thin">
                {matches.slice(0, 20).map((u) => (
                  <div key={u.id} className="flex items-center gap-2 rounded-md bg-background/80 p-2 text-xs">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                      {initials(u.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{u.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">
                        {u.employee?.title ?? "—"}
                      </div>
                    </div>
                  </div>
                ))}
                {matches.length === 0 && (
                  <div className="rounded-md border border-dashed py-6 text-center text-xs text-muted-foreground">
                    Add or refine conditions to see matches
                  </div>
                )}
                {matches.length > 20 && (
                  <div className="text-center text-[10px] text-muted-foreground">
                    + {matches.length - 20} more
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
            {isEdit && (
              <Button
                variant="outline"
                onClick={remove}
                disabled={deletePending}
                className="mr-auto text-rose-600 hover:text-rose-600"
              >
                {deletePending ? "Deleting…" : "Delete group"}
              </Button>
            )}
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!canSave || pending}>
              <CheckCircle2 className={cn("h-4 w-4")} />
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create group"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
