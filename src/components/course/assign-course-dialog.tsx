"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Search, Send, Users, X } from "lucide-react";
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

export function AssignCourseDialog({
  courseId,
  courseTitle,
  candidates,
  triggerLabel = "Assign",
  triggerVariant = "default",
}: {
  courseId: string;
  courseTitle: string;
  candidates: Candidate[];
  triggerLabel?: string;
  triggerVariant?: "default" | "outline" | "ghost";
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [dueAt, setDueAt] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.title?.toLowerCase().includes(q) ||
        c.department?.toLowerCase().includes(q)
    );
  }, [candidates, query]);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submit = () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    startTransition(async () => {
      const res = await assignCourse({
        courseId,
        userIds: ids,
        method: "manual",
        dueAt: dueAt ? new Date(dueAt).toISOString() : undefined,
      });
      if (res.ok) {
        toast({
          title: "Assignments created",
          description: `${courseTitle} → ${res.created} ${res.created === 1 ? "person" : "people"}.`,
          variant: "success",
        });
        setSelected(new Set());
        setOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant={triggerVariant}>
          <Send className="h-4 w-4" /> {triggerLabel}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-background/70 backdrop-blur data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-primary" /> Assign {courseTitle}
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="space-y-3 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people by name, title, department…"
              />
            </div>
            <div className="max-h-64 overflow-y-auto scrollbar-thin rounded-lg border">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  No matches
                </div>
              ) : (
                <ul className="divide-y">
                  {filtered.map((c) => {
                    const isSelected = selected.has(c.id);
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => toggle(c.id)}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2 text-left transition",
                            isSelected ? "bg-primary/10" : "hover:bg-accent/60"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded border",
                              isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                            )}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </span>
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                            {initials(c.name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium">{c.name}</div>
                            <div className="truncate text-[11px] text-muted-foreground">
                              {c.title ?? c.email}
                              {c.department ? ` · ${c.department}` : ""}
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
          </div>
          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3">
            <div className="text-xs text-muted-foreground">
              <Badge variant="secondary" className="mr-2">{selected.size}</Badge>
              selected
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={selected.size === 0 || pending}>
                {pending ? "Assigning…" : `Assign to ${selected.size || 0}`}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
