"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { BellRing, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { saveNotificationTemplate } from "@/app/actions/mutations";

type Level = "platform" | "organization" | "workspace";
type EventName =
  | "assignment"
  | "due_soon"
  | "overdue"
  | "expiration"
  | "manager_digest"
  | "completion"
  | "path_completion"
  | "certificate_issued"
  | "live_session_reminder"
  | "evidence_review";

export interface TemplateDraft {
  id?: string;
  level: Level;
  orgId?: string;
  workspaceId?: string;
  event: EventName;
  subject: string;
  body: string;
  enabled: boolean;
}

const events: Array<{ value: EventName; label: string }> = [
  { value: "assignment", label: "New assignment" },
  { value: "due_soon", label: "Due soon" },
  { value: "overdue", label: "Overdue" },
  { value: "expiration", label: "Expiration warning" },
  { value: "manager_digest", label: "Manager digest" },
  { value: "completion", label: "Completion confirmation" },
  { value: "path_completion", label: "Path completion" },
  { value: "certificate_issued", label: "Certificate issued" },
  { value: "live_session_reminder", label: "Live session reminder" },
  { value: "evidence_review", label: "Evidence review request" },
];

export function NotificationTemplateDialog({
  trigger,
  existing,
  level,
  orgId,
  workspaceId,
}: {
  trigger: React.ReactNode;
  existing?: TemplateDraft;
  level: Level;
  orgId?: string;
  workspaceId?: string;
}) {
  const isEdit = !!existing?.id;
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<TemplateDraft>(
    existing ?? {
      level,
      orgId,
      workspaceId,
      event: "due_soon",
      subject: "",
      body: "",
      enabled: true,
    }
  );
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const canSave = draft.subject.trim().length > 0 && draft.body.trim().length > 0;

  const submit = () => {
    startTransition(async () => {
      const res = await saveNotificationTemplate(draft);
      if (res.ok) {
        toast({
          title: isEdit ? "Template updated" : "Template saved",
          description: draft.subject,
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
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] w-[94vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <Dialog.Title className="flex items-center gap-2 text-sm font-semibold">
              {isEdit ? <Pencil className="h-4 w-4 text-primary" /> : <BellRing className="h-4 w-4 text-primary" />}
              {isEdit ? "Edit template" : "New notification template"}
            </Dialog.Title>
            <Dialog.Close className="rounded p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <Label>Event</Label>
              <select
                className="mt-1 h-9 w-full rounded-md border bg-background px-2 text-sm"
                value={draft.event}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, event: e.target.value as EventName }))
                }
              >
                {events.map((ev) => (
                  <option key={ev.value} value={ev.value}>
                    {ev.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                className="mt-1"
                placeholder="e.g. {{course_title}} is due {{due_date}}"
                value={draft.subject}
                onChange={(e) => setDraft((d) => ({ ...d, subject: e.target.value }))}
              />
            </div>
            <div>
              <Label>Body</Label>
              <textarea
                className="mt-1 min-h-[120px] w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder={"Hi {{first_name}}, your training is due soon…"}
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              />
              <p className="mt-1 text-[10px] text-muted-foreground">
                Tokens: {"{{first_name}} {{course_title}} {{due_date}} {{launch_link}}"}
              </p>
            </div>
            <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={draft.enabled}
                onChange={(e) => setDraft((d) => ({ ...d, enabled: e.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
              <span className="flex-1 text-xs text-muted-foreground">
                Enabled — the cadence engine will use this template
              </span>
            </label>
          </div>
          <div className="flex items-center justify-end gap-2 border-t bg-muted/20 px-4 py-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!canSave || pending}>
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create template"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
