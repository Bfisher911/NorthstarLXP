import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { auditLog, getOrgBySlug, getUserById } from "@/lib/data";
import { formatDate } from "@/lib/utils";

export default async function OrgAuditPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const entries = auditLog.filter((a) => a.orgId === org.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Audit"
        title="Organization audit log"
        description={`All privileged actions scoped to ${org.name}.`}
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
              </tr>
            </thead>
            <tbody className="divide-y">
              {entries.map((e) => {
                const actor = getUserById(e.actorId);
                return (
                  <tr key={e.id}>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(e.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="px-4 py-3 font-medium">{actor?.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{e.action}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.target ?? "—"}</td>
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
