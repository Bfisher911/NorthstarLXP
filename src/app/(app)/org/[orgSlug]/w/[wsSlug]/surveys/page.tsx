import { notFound } from "next/navigation";
import { ArrowRight, FileCheck2, Plus, Workflow } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sankey, type SankeyLink, type SankeyNode } from "@/components/charts/sankey";
import { getCourseById, getOrgBySlug, getWorkspaceBySlug, surveys } from "@/lib/data";

export default async function SurveysPage({
  params,
}: {
  params: Promise<{ orgSlug: string; wsSlug: string }>;
}) {
  const { orgSlug, wsSlug } = await params;
  const org = getOrgBySlug(orgSlug);
  if (!org) notFound();
  const ws = getWorkspaceBySlug(org.id, wsSlug);
  if (!ws) notFound();
  const wsSurveys = surveys.filter((s) => s.workspaceId === ws.id);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><FileCheck2 className="h-3 w-3" /> Surveys</span>}
        title="Needs assessments & trigger logic"
        description="Build forms whose answers trigger downstream course assignments. Schedule them annually, on hire, or on demand."
        actions={<Button><Plus className="h-4 w-4" /> New survey</Button>}
      />

      {wsSurveys.map((s) => {
        // Build a Sankey flow: question → chosen answer → triggered course.
        // Value is a plausible mock of learners who selected each answer.
        const nodes: SankeyNode[] = [];
        const links: SankeyLink[] = [];
        s.questions.forEach((q, qi) => {
          const qId = `q_${q.id}`;
          nodes.push({ id: qId, label: `Q${qi + 1}`, column: 0, color: "#3d66ff" });
          q.options.forEach((o, oi) => {
            const oId = `${q.id}_${o.id}`;
            nodes.push({
              id: oId,
              label: `${q.options[oi].label}`,
              column: 1,
              color: o.id === "y" ? "#34d399" : "#94a3b8",
            });
            const answerVolume = o.id === "y" ? 420 - qi * 50 : 180 + qi * 40;
            links.push({ from: qId, to: oId, value: answerVolume });
            if (o.triggersCourseId) {
              const course = getCourseById(o.triggersCourseId);
              const cId = `c_${o.triggersCourseId}`;
              if (!nodes.find((n) => n.id === cId)) {
                nodes.push({ id: cId, label: course?.title ?? "Course", column: 2, color: "#a78bfa" });
              }
              links.push({ from: oId, to: cId, value: answerVolume });
            }
          });
        });

        return (
          <Card key={s.id}>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>{s.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
            </div>
            <Badge variant="info" className="capitalize">{s.schedule.replace("_", " ")}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {s.questions.map((q, i) => (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="text-sm font-semibold">Q{i + 1}. {q.prompt}</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {q.options.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm">
                      <span>{o.label}</span>
                      {o.triggersCourseId && (
                        <Badge variant="info" className="gap-1">
                          triggers <ArrowRight className="h-3 w-3" /> {getCourseById(o.triggersCourseId)?.title ?? "course"}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-xl border bg-muted/20 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Workflow className="h-4 w-4 text-primary" /> Answers → triggered assignments
              </div>
              <Sankey nodes={nodes} links={links} height={220} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Schedule: {s.schedule.replace("_", " ")}</Badge>
              <Badge variant="outline">{s.published ? "Published" : "Draft"}</Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/org/${orgSlug}/w/${wsSlug}/surveys/${s.id}`}>Edit rules →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        );
      })}
    </div>
  );
}
