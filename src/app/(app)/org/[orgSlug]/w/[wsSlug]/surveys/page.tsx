import { notFound } from "next/navigation";
import { ArrowRight, FileCheck2, Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

      {wsSurveys.map((s) => (
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
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Schedule: {s.schedule.replace("_", " ")}</Badge>
              <Badge variant="outline">{s.published ? "Published" : "Draft"}</Badge>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/org/${orgSlug}/w/${wsSlug}/surveys/${s.id}`}>Edit rules →</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
