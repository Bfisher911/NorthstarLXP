import { Database } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function FeedSyncPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Database className="h-3 w-3" /> Feed sync</span>}
        title="Employee feed synchronization"
        description="Scaffolded — connects to Workday / UKG / BambooHR / CSV imports per tenant in Phase 1."
      />
      <Card>
        <CardContent className="p-6">
          <EmptyState
            title="Connectors coming online"
            description="The feed ingestion layer will land in this page: manage connectors per tenant, map fields, schedule syncs, and monitor failures."
          />
        </CardContent>
      </Card>
    </div>
  );
}
