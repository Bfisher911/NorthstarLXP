import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { certificates, getCourseById, getOrgBySlug, getUserById } from "@/lib/data";
import { formatDate } from "@/lib/utils";

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Compliance</span>}
        title="Organizational compliance snapshot"
        description="Credentials rolled up from every workspace — an easy audit view for leadership."
      />

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
  items: ReturnType<typeof Array.prototype.filter> extends never ? never : any[];
  tone: "success" | "warning" | "destructive";
  collapsedPreview?: boolean;
}) {
  const slice = collapsedPreview ? items.slice(0, 6) : items;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">{title}
          <Badge variant={tone}>{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {slice.length === 0 && (
          <div className="py-4 text-sm text-muted-foreground">None.</div>
        )}
        {slice.map((c: any) => {
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
                {c.expiresAt ? `${c.status === "expired" ? "Expired" : "Expires"} ${formatDate(c.expiresAt)}` : ""}
              </div>
              <Badge variant={tone}>{c.status}</Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
