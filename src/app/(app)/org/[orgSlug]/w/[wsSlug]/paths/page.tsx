import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Compass, Plus } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getOrgBySlug, getPathsForWorkspace, getWorkspaceBySlug } from "@/lib/data";

export default async function WsPathsPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const paths = getPathsForWorkspace(ws.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Compass className="h-3 w-3" /> Learning paths</span>}
        title={`${ws.name} · Learning paths`}
        description="Workspace-scoped paths. Organization-wide paths live under the org-level navigation."
        actions={
          <Button asChild>
            <Link href={`/org/${orgSlug}/w/${wsSlug}/paths/new`}>
              <Plus className="h-4 w-4" /> New path
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {paths.length === 0 && (
          <Card>
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              No paths yet. Try the path builder.
            </CardContent>
          </Card>
        )}
        {paths.map((p) => (
          <Card key={p.id} className="group overflow-hidden transition hover:border-primary/50">
            <div className="h-2 bg-gradient-to-r from-northstar-500 via-constellation-nova to-northstar-400" />
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Compass className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold">{p.name}</span>
                    {p.required && <Badge variant="info">Required</Badge>}
                  </div>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{p.summary}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.assignedCount.toLocaleString()} learners</span>
                <span>{Math.round(p.completionRate * 100)}% complete</span>
              </div>
              <Progress value={p.completionRate * 100} className="h-1.5" />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/org/${orgSlug}/w/${wsSlug}/paths/${p.id}`}>Open <ArrowRight className="h-3 w-3" /></Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/org/${orgSlug}/w/${wsSlug}/paths/${p.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
