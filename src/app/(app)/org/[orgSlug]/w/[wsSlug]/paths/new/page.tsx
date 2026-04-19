import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { getOrgBySlug, getWorkspaceBySlug } from "@/lib/data";

export default async function NewPathPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/org/${orgSlug}/w/${wsSlug}/paths`}><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
      </Button>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Compass className="h-3 w-3" /> New path</span>}
        title={`Create a path in ${ws.name}`}
        description="Create the shell, then lay out nodes in the builder."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Path basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input placeholder="e.g. Annual Safety Recertification" className="mt-1" />
          </div>
          <div>
            <Label>Audience</Label>
            <Input placeholder="Who should take this?" className="mt-1" />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Required</div>
              <div className="text-xs text-muted-foreground">Assignable via smart rules or org paths.</div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <div className="text-sm font-medium">Award credential on completion</div>
              <div className="text-xs text-muted-foreground">Creates a renewable credential for each learner.</div>
            </div>
            <Switch defaultChecked />
          </div>
          <Button>Create and open builder</Button>
        </CardContent>
      </Card>
    </div>
  );
}
