import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { organizations, workspaces } from "@/lib/data";
import { formatPct } from "@/lib/utils";

export default function OrgIndexPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tenants"
        title="Organizations"
        description="All client organizations on the platform."
        actions={<Button><Building2 className="h-4 w-4" /> New organization</Button>}
      />

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Organization</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Seats</th>
                <th className="px-4 py-3 text-left">Workspaces</th>
                <th className="px-4 py-3 text-left">Health</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {organizations.map((o) => (
                <tr key={o.id} className="hover:bg-accent/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-northstar-500 to-northstar-700 text-xs font-semibold text-white">
                        {o.logoInitials}
                      </div>
                      <div>
                        <div className="font-semibold">{o.name}</div>
                        <div className="text-xs text-muted-foreground">{o.primaryDomain}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="capitalize">{o.plan}</Badge>
                  </td>
                  <td className="px-4 py-3">{o.activeLearners.toLocaleString()} / {o.seats.toLocaleString()}</td>
                  <td className="px-4 py-3">{workspaces.filter((w) => w.orgId === o.id).length}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" style={{ width: `${o.complianceHealth * 100}%` }} />
                      </div>
                      <span className="text-xs font-medium">{formatPct(o.complianceHealth)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/org/${o.slug}`}>Open <ArrowRight className="h-3 w-3" /></Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
