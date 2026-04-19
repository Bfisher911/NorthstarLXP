import { BellRing } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function RemindersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Communication"
        title="Reminders sent"
        description="Every nudge you've sent to a team member, in order. Scaffolded — wires into the notifications service in Phase 4."
      />
      <EmptyState
        icon={<BellRing className="h-5 w-5" />}
        title="No reminders sent yet"
        description="Reminders you send from the dashboard or team pages appear here with delivery receipts."
      />
    </div>
  );
}
