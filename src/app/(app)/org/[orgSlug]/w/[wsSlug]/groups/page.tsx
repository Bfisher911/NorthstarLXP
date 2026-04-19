import { notFound } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getOrgBySlug, getWorkspaceBySlug, smartGroups } from "@/lib/data";

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const groups = smartGroups.filter((g) => !g.workspaceId || g.workspaceId === ws.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Smart groups</span>}
        title="Reusable audiences"
        description="Define an audience once with rules — re-use it across assignments, notifications, and reports."
        actions={<Button><Plus className="h-4 w-4" /> New group</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.id}>
            <CardHeader>
              <CardTitle>{g.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{g.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rules</div>
              <div className="flex flex-wrap gap-2">
                {g.conditions.map((c, i) => (
                  <Badge key={i} variant="outline" className="capitalize">
                    {c.field.replace("_", " ")} {c.op.replace("_", " ")} "{String(c.value)}"
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-muted-foreground">{g.memberCount} members</span>
                <Button variant="outline" size="sm">Preview members</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
