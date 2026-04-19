import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { organizations } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "lucide-react";

const monthly: Record<string, number> = {
  starter: 8,
  growth: 18,
  enterprise: 32,
};

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><CreditCard className="h-3 w-3" /> Billing & usage</span>}
        title="Plan, usage, and invoicing"
        description="Scaffolded — wires into Stripe or your billing system in production."
      />
      <Card>
        <CardHeader>
          <CardTitle>Tenant subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Tenant</th>
                <th className="px-4 py-3 text-left">Plan</th>
                <th className="px-4 py-3 text-left">Seats in use</th>
                <th className="px-4 py-3 text-left">Storage</th>
                <th className="px-4 py-3 text-right">Monthly estimate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {organizations.map((o) => {
                const seatPrice = monthly[o.plan] ?? 10;
                const est = o.activeLearners * seatPrice;
                return (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium">{o.name}</td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize">{o.plan}</Badge></td>
                    <td className="px-4 py-3">{o.activeLearners.toLocaleString()} / {o.seats.toLocaleString()}</td>
                    <td className="px-4 py-3">{o.storageGb} / {o.storageQuotaGb} GB</td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${est.toLocaleString()}
                    </td>
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
