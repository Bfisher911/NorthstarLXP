import { notFound } from "next/navigation";
import { Pencil, Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SmartGroupBuilder } from "@/components/people/smart-group-builder";
import { getOrgBySlug, getWorkspaceBySlug, smartGroups, users } from "@/lib/data";

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
  const orgUsers = users.filter((u) => u.orgId === org.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> Smart groups</span>}
        title="Reusable audiences"
        description="Define an audience once with rules — re-use it across assignments, notifications, and reports."
        actions={<SmartGroupBuilder orgId={org.id} workspaceId={ws.id} candidates={orgUsers} />}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <Card key={g.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle>{g.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{g.description}</p>
              </div>
              <SmartGroupBuilder
                orgId={org.id}
                workspaceId={ws.id}
                candidates={orgUsers}
                existing={{
                  id: g.id,
                  name: g.name,
                  description: g.description,
                  conditions: g.conditions,
                }}
                trigger={
                  <Button variant="outline" size="sm" aria-label="Edit group">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Rules</div>
              <div className="flex flex-wrap gap-2">
                {g.conditions.map((c, i) => (
                  <Badge key={i} variant="outline" className="capitalize">
                    {c.field.replace("_", " ")} {c.op.replace("_", " ")} &ldquo;{String(c.value)}&rdquo;
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-muted-foreground">{g.memberCount} members</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
