import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Compass, Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getOrgBySlug, getPathsForOrg, getWorkspaceById } from "@/lib/data";

export default async function OrgPathsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const paths = getPathsForOrg(org.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Compass className="h-3 w-3" /> Org learning paths</span>}
        title="Organizational learning paths"
        description="Combine courses from any workspace into a single journey that spans the whole organization."
        actions={
          <Button asChild>
            <Link href={`/org/${orgSlug}/paths/new`}>
              <Plus className="h-4 w-4" /> New org path
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {paths.map((p) => {
          const origin = p.workspaceId ? getWorkspaceById(p.workspaceId) : null;
          return (
            <Card key={p.id} className="group overflow-hidden transition hover:border-primary/50">
              <div className="relative h-2 bg-gradient-to-r from-northstar-500 via-constellation-nova to-northstar-400" />
              <CardContent className="space-y-3 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold">{p.name}</span>
                      {p.required && <Badge variant="info">Required</Badge>}
                      {!p.workspaceId && <Badge variant="secondary">Org-wide</Badge>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {origin ? `Source: ${origin.name}` : "Org-wide"}
                  </span>
                  <span>{p.assignedCount.toLocaleString()} learners · {Math.round(p.completionRate * 100)}% complete</span>
                </div>
                <Progress value={p.completionRate * 100} className="h-1.5" />
                <div className="flex justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/org/${orgSlug}/paths/${p.id}`}>
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
