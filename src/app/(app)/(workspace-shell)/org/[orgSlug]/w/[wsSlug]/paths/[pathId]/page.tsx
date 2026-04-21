import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Compass, Edit3, Send } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { JourneyMap } from "@/components/path/journey-map";
import { getCourseById, getOrgBySlug, getPathById, getWorkspaceBySlug } from "@/lib/data";

export default async function WsPathDetail({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string; pathId: string }>;
}) {
  const { orgSlug, wsSlug, pathId } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const path = getPathById(pathId);
  if (!path) notFound();

  const statuses: Record<string, "completed" | "available"> = {};
  path.nodes.forEach((n) => (statuses[n.id] = "available"));

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/org/${orgSlug}/w/${wsSlug}/paths`}><ArrowLeft className="h-3.5 w-3.5" /> Back</Link>
      </Button>

      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><Compass className="h-3 w-3" /> Workspace path</span>}
        title={path.name}
        description={path.summary}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/org/${orgSlug}/w/${wsSlug}/paths/${pathId}/edit`}>
                <Edit3 className="h-4 w-4" /> Open builder
              </Link>
            </Button>
            <Button>
              <Send className="h-4 w-4" /> Assign to learners
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Learners assigned" value={path.assignedCount.toLocaleString()} />
        <Stat label="Completion" value={`${Math.round(path.completionRate * 100)}%`} />
        <Stat label="Required?" value={path.required ? "Yes" : "Optional"} />
      </div>

      <Progress value={path.completionRate * 100} className="h-2" />

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
              return (
                <div key={n.id} className="flex items-center gap-3 py-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${c.thumbnailColor} text-lg`}>
                    {c.thumbnailEmoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{c.title}</div>
                    <div className="text-xs text-muted-foreground">{c.category} · {c.durationMinutes} min</div>
                  </div>
                  <Badge variant="outline">{n.required ? "Required" : "Optional"}</Badge>
                </div>
              );
            })}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-display text-xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  );
}
