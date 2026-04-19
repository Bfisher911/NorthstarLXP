import { Activity } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auditLog, getUserById } from "@/lib/data";
import { relativeDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Activity className="h-3 w-3" /> Activity</span>}
        title="Platform activity & incidents"
        description="Recent noteworthy events across all tenants."
      />
      <Card>
        <CardHeader>
          <CardTitle>Recent events</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {auditLog.map((a) => {
            const actor = getUserById(a.actorId);
            return (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <div className="text-sm">
                    <span className="font-medium">{actor?.name ?? "System"}</span>{" "}
                    <span className="text-muted-foreground">— {a.action.replace(/\./g, " · ")}</span>
                    {a.target && <span className="ml-1 text-muted-foreground">→ {a.target}</span>}
                  </div>
                  {a.meta?.reason != null && (
                    <div className="text-xs text-muted-foreground">&quot;{String(a.meta.reason)}&quot;</div>
                  )}
                </div>
                <Badge variant="outline">{relativeDate(a.createdAt)}</Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
