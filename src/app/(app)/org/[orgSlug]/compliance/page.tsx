import { notFound } from "next/navigation";
import { AlertTriangle, Award, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/shell/kpi-card";
import { StatRing } from "@/components/ui/stat-ring";
import { certificates, getCourseById, getOrgBySlug, getUserById } from "@/lib/data";
import { formatDate } from "@/lib/utils";
import type { Certificate } from "@/lib/types";

export default async function OrgCompliancePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();

  const relevant = certificates.filter((c) => {
    const u = getUserById(c.userId);
    return u?.orgId === org.id;
  });

  const grouped = {
    expiring: relevant.filter((c) => c.status === "expiring"),
    expired: relevant.filter((c) => c.status === "expired"),
    active: relevant.filter((c) => c.status === "active"),
  };

  const total = relevant.length;
  const healthPct = total === 0 ? 0 : grouped.active.length / total;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Compliance</span>}
        title="Organizational compliance snapshot"
        description="Credentials rolled up from every workspace — an easy audit view for leadership."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-1">
          <CardContent className="flex flex-col items-center justify-center p-5">
            <StatRing value={healthPct} size={120} stroke={10} sublabel="Active" tone={healthPct > 0.85 ? "emerald" : healthPct > 0.7 ? "amber" : "rose"} />
            <div className="mt-2 text-xs text-muted-foreground">Org credential health</div>
          </CardContent>
        </Card>
        <KpiCard label="Active credentials" value={grouped.active.length} icon={ShieldCheck} accent="emerald" />
        <KpiCard label="Expiring (30d)" value={grouped.expiring.length} icon={Award} accent="amber" />
        <KpiCard label="Expired" value={grouped.expired.length} icon={AlertTriangle} accent="rose" />
      </div>

      <Section title="Expiring in the next 30 days" items={grouped.expiring} tone="warning" />
      <Section title="Expired" items={grouped.expired} tone="destructive" />
      <Section title="Active credentials" items={grouped.active} tone="success" collapsedPreview />
    </div>
  );
}

function Section({
  title,
  items,
  tone,
  collapsedPreview,
}: {
  title: string;
  items: Certificate[];
  tone: "success" | "warning" | "destructive";
  collapsedPreview?: boolean;
}) {
  const slice = collapsedPreview ? items.slice(0, 6) : items;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          <Badge variant={tone}>{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {slice.length === 0 && <div className="py-4 text-sm text-muted-foreground">None.</div>}
        {slice.map((c) => {
          const u = getUserById(c.userId);
          const course = c.courseId ? getCourseById(c.courseId) : null;
          return (
            <div key={c.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{u?.name}</div>
                <div className="text-xs text-muted-foreground">
                  {course?.title} · {c.credentialCode}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                {c.expiresAt
                  ? `${c.status === "expired" ? "Expired" : "Expires"} ${formatDate(c.expiresAt)}`
                  : ""}
              </div>
              <Badge variant={tone}>{c.status}</Badge>
            </div>
          );
        })}
        {collapsedPreview && items.length > 6 && (
          <div className="py-3 text-xs text-muted-foreground">+ {items.length - 6} more active credentials</div>
        )}
      </CardContent>
    </Card>
  );
}
