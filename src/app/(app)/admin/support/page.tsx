import { LifeBuoy } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><LifeBuoy className="h-3 w-3" /> Support</span>}
        title="Support queue"
        description="Scaffolded — will integrate with the helpdesk provider (Zendesk/Intercom/HelpScout) per tenant."
      />
      <EmptyState title="No open tickets right now" description="New support tickets from tenants appear here." />
    </div>
  );
}
