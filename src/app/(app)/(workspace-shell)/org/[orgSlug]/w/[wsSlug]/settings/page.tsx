import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getOrgBySlug, getUserById, getWorkspaceBySlug } from "@/lib/data";

export default async function WsSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const lead = getUserById(ws.lead);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace settings"
        title={`${ws.name} · Settings`}
        description="Workspace-scoped configuration. Organization-level defaults apply unless you override them here."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input defaultValue={ws.name} className="mt-1" />
            </div>
            <div>
              <Label>Department</Label>
              <Input defaultValue={ws.department} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Input defaultValue={ws.description} className="mt-1" />
            </div>
            <div>
              <Label>Lead</Label>
              <Input defaultValue={lead?.name ?? ""} className="mt-1" />
            </div>
            <Button>Save</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions</CardTitle>
            <p className="text-sm text-muted-foreground">Role scopes are locked to this workspace unless granted elsewhere.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Toggle label="Authors can publish without admin review" defaultChecked />
            <Toggle label="Authors can assign directly" />
            <Toggle label="Viewers can export reports" defaultChecked />
            <Toggle label="Allow self-enrollment from learner portal" defaultChecked />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Defaults for new courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Toggle label="Required by default" />
            <Toggle label="Issue certificate by default" defaultChecked />
            <Toggle label="Renewal 12 months" defaultChecked />
            <Toggle label="Share to organization by default" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI engine</CardTitle>
            <p className="text-sm text-muted-foreground">Control how AI assignment suggestions behave in this workspace.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Toggle label="Auto-approve suggestions above 95% confidence" />
            <Toggle label="Daily grooming job" defaultChecked />
            <Toggle label="Explain suggestions in audit log" defaultChecked />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm">{label}</div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
