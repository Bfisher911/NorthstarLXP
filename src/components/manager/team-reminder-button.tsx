"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { sendReminder } from "@/app/actions/mutations";

export function TeamReminderButton({ userIds, label = "Send team reminder" }: { userIds: string[]; label?: string }) {
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <Button
      disabled={pending || userIds.length === 0}
      onClick={() =>
        startTransition(async () => {
          const res = await sendReminder({ userIds, template: "due_soon" });
          if (res.ok) {
            toast({
              title: "Reminder queued",
              description: `${res.sent} team member${res.sent === 1 ? "" : "s"} will receive a nudge.`,
              variant: "success",
            });
            router.refresh();
          }
        })
      }
    >
      <BellRing className="h-4 w-4" /> {pending ? "Sending…" : label}
    </Button>
  );
}
