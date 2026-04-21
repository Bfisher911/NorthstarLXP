import { notFound } from "next/navigation";
import { BellRing, Edit3, Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NotificationTemplateDialog } from "@/components/notifications/template-dialog";
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

      <Section
        title="Workspace overrides"
        items={byLevel.workspace}
        hint={`Only applies within ${ws.name}.`}
        level="workspace"
        orgId={org.id}
        workspaceId={ws.id}
        editable
      />
      <Section
        title="Organization defaults"
        items={byLevel.organization}
        hint="From the org settings."
        level="organization"
        orgId={org.id}
        editable={false}
      />
      <Section
        title="Platform defaults"
        items={byLevel.platform}
        hint="Vendor-level fallback."
        level="platform"
        dimmed
        editable={false}
      />
    </div>
  );
}

function Section({
  title,
  items,
  hint,
  dimmed,
  level,
  orgId,
  workspaceId,
  editable,
}: {
  title: string;
  items: typeof notificationTemplates;
  hint: string;
  dimmed?: boolean;
  level: "platform" | "organization" | "workspace";
  orgId?: string;
  workspaceId?: string;
  editable?: boolean;
}) {
  return (
    <Card className={dimmed ? "opacity-80" : ""}>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
        </div>
        {editable && (
          <NotificationTemplateDialog
            level={level}
            orgId={orgId}
            workspaceId={workspaceId}
            trigger={
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5" /> New template
              </Button>
            }
          />
        )}
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
            {editable ? (
              <NotificationTemplateDialog
                level={n.level}
                orgId={n.orgId}
                workspaceId={n.workspaceId}
                existing={{
                  id: n.id,
                  level: n.level,
                  orgId: n.orgId,
                  workspaceId: n.workspaceId,
                  event: n.event,
                  subject: n.subject,
                  body: n.body,
                  enabled: n.enabled,
                }}
                trigger={
                  <Button size="sm" variant="outline" aria-label="Edit template">
                    <Edit3 className="h-3 w-3" />
                  </Button>
                }
              />
            ) : (
              <Button size="sm" variant="ghost" disabled title="Read-only at this scope">
                <Edit3 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="py-4 text-sm text-muted-foreground">No overrides here.</div>}
      </CardContent>
    </Card>
  );
}
