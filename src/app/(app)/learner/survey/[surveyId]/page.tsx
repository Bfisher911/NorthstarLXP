import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileCheck2 } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { SurveyPlayer } from "@/components/learner/survey-player";
import { requireSession } from "@/lib/auth";
import { getCourseById, surveys } from "@/lib/data";

export default async function LearnerSurveyPage({
  params,
}: {
  params: Promise<{ surveyId: string }>;
}) {
  const { surveyId } = await params;
  const { user } = await requireSession();
  const survey = surveys.find((s) => s.id === surveyId);
  if (!survey) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/learner/training">
          <ArrowLeft className="h-3.5 w-3.5" /> My training
        </Link>
      </Button>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-1"><FileCheck2 className="h-3 w-3" /> Needs assessment</span>}
        title={survey.title}
        description={
          survey.description ??
          "Answer honestly — your answers drive automatic assignment of the training you actually need."
        }
      />
      <SurveyPlayer
        surveyId={survey.id}
        userId={user.id}
        title={survey.title}
        questions={survey.questions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options.map((o) => ({
            id: o.id,
            label: o.label,
            triggersCourseTitle: o.triggersCourseId
              ? getCourseById(o.triggersCourseId)?.title
              : undefined,
          })),
        }))}
      />
    </div>
  );
}
