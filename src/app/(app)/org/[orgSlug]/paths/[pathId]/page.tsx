import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Compass, Users } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JourneyMap } from "@/components/path/journey-map";
import { getCourseById, getOrgBySlug, getPathById, getWorkspaceById } from "@/lib/data";

export default async function OrgPathDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pathId: string }>;
}) {
  const { orgSlug, pathId } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const path = getPathById(pathId);
  if (!path) notFound();

  const statuses: Record<string, "completed" | "available"> = {};
  for (const n of path.nodes) statuses[n.id] = "available";

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/org/${orgSlug}/paths`}>
          <ArrowLeft className="h-3.5 w-3.5" /> All org paths
        </Link>
      </Button>

      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Compass className="h-3 w-3" /> Org path</span>}
        title={path.name}
        description={path.summary}
        actions={
          <>
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" /> {path.assignedCount.toLocaleString()} assigned
            </Badge>
            <Button variant="outline">Edit path</Button>
            <Button>Assign more</Button>
          </>
        }
      />

      <JourneyMap path={path} statuses={statuses} height={520} />

      <Card>
        <CardHeader>
          <CardTitle>Referenced content</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {path.nodes
            .filter((n) => n.courseId)
            .map((n) => {
              const c = getCourseById(n.courseId!)!;
              const src = getWorkspaceById(c.workspaceId);
              return (
                <div key={n.id} className="flex items-center gap-3 py-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.thumbnailColor} text-lg`}>
                    {c.thumbnailEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.category} · {c.durationMinutes} min · Source: {src?.name ?? "—"}
                    </div>
                  </div>
                  {c.shareToOrg ? (
                    <Badge variant="info">Shared org-wide</Badge>
                  ) : (
                    <Badge variant="outline">Workspace only</Badge>
                  )}
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}
