import { notFound } from "next/navigation";
import { BellRing, Edit3 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getOrgBySlug, getWorkspaceBySlug, notificationTemplates } from "@/lib/data";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();

  const byLevel = {
    platform: notificationTemplates.filter((n) => n.level === "platform"),
    organization: notificationTemplates.filter((n) => n.level === "organization" && n.orgId === org.id),
    workspace: notificationTemplates.filter((n) => n.level === "workspace" && n.workspaceId === ws.id),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><BellRing className="h-3 w-3" /> Notifications</span>}
        title="Notification cadence"
        description="Workspace-level templates override organization defaults, which override platform defaults. Each workspace admin owns their workspace tone."
      />

      <Section title="Workspace overrides" items={byLevel.workspace} hint={`Only applies within ${ws.name}.`} />
      <Section title="Organization defaults" items={byLevel.organization} hint="From the org settings." />
      <Section title="Platform defaults" items={byLevel.platform} hint="Vendor-level fallback." dimmed />
    </div>
  );
}

function Section({
  title,
  items,
  hint,
  dimmed,
}: {
  title: string;
  items: typeof notificationTemplates;
  hint: string;
  dimmed?: boolean;
}) {
  return (
    <Card className={dimmed ? "opacity-80" : ""}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
        <Button variant="outline" size="sm">New template</Button>
      </CardHeader>
      <CardContent className="divide-y">
        {items.map((n) => (
          <div key={n.id} className="flex items-start gap-4 py-3">
            <Badge variant="outline" className="capitalize">{n.event.replace("_", " ")}</Badge>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{n.subject}</div>
              <div className="line-clamp-2 text-xs text-muted-foreground">{n.body}</div>
            </div>
            <Switch defaultChecked={n.enabled} />
            <Button size="sm" variant="outline">
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <div className="py-4 text-sm text-muted-foreground">No overrides here.</div>}
      </CardContent>
    </Card>
  );
}
