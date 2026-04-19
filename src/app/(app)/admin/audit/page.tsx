import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { auditLog, getUserById } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit"
        title="Platform audit log"
        description="Immutable log of privileged actions. Exportable for compliance reviews."
      />
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">When</th>
                <th className="px-4 py-3 text-left">Actor</th>
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Target</th>
                <th className="px-4 py-3 text-left">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {auditLog.map((e) => {
                const actor = getUserById(e.actorId);
                return (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(e.createdAt, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 font-medium">{actor?.name ?? "system"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.action}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.target ?? "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{e.meta?.reason ? String(e.meta.reason) : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
