import { notFound } from "next/navigation";
import { Palette, Settings } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { getOrgBySlug } from "@/lib/data";

export default async function OrgSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Settings className="h-3 w-3" /> Organization settings</span>}
        title="Settings"
        description={`Branding, terminology, certificate templates, and default notification cadence for ${org.name}.`}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organization profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Organization name</Label>
              <Input defaultValue={org.name} className="mt-1" />
            </div>
            <div>
              <Label>Primary domain</Label>
              <Input defaultValue={org.primaryDomain} className="mt-1" />
            </div>
            <div>
              <Label>Headquarters</Label>
              <Input defaultValue={org.headquarters} className="mt-1" />
            </div>
            <Button>Save changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-4 w-4" /> Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Toggle label="Use organization branding on the learner portal" hint="Logo, accent color, and certificate header." defaultChecked />
            <Toggle label="Terminology: Use 'Employee' instead of 'Learner'" hint="Applies to all learner-facing strings." />
            <Toggle label="Require MFA for admin roles" defaultChecked />
            <Toggle label="Anonymize analytics exports" hint="Removes identifiable fields from CSV exports." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification defaults</CardTitle>
            <p className="text-sm text-muted-foreground">Workspace admins can override these within their workspace.</p>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Due-soon reminder</span>
              <span className="text-muted-foreground">7 days before</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Overdue escalation</span>
              <span className="text-muted-foreground">Day after + weekly</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Expiration warning</span>
              <span className="text-muted-foreground">60 days before</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Manager digest</span>
              <span className="text-muted-foreground">Weekly · Monday 8:00 AM</span>
            </div>
            <Button variant="outline">Edit templates</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificate templates</CardTitle>
            <p className="text-sm text-muted-foreground">Your branded templates. Paths can override with their own templates.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Default — Landscape", "Executive — Portrait", "Compliance — Seal"].map((t) => (
              <div key={t} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm">{t}</span>
                <Button variant="outline" size="sm">Preview</Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ label, hint, defaultChecked }: { label: string; hint?: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
