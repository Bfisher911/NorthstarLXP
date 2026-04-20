"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { submitSurvey } from "@/app/actions/mutations";
import { cn } from "@/lib/utils";

export interface SurveyQuestion {
  id: string;
  prompt: string;
  options: Array<{ id: string; label: string; triggersCourseTitle?: string }>;
}

/**
 * Runs the learner through a seeded survey one question at a time. Answers
 * are collected locally; on submit we call `submitSurvey` which auto-assigns
 * any triggered courses server-side.
 */
export function SurveyPlayer({
  surveyId,
  userId,
  title,
  questions,
}: {
  surveyId: string;
  userId: string;
  title: string;
  questions: SurveyQuestion[];
}) {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [index, setIndex] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [triggered, setTriggered] = React.useState<string[]>([]);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const q = questions[index];
  const answered = q ? !!answers[q.id] : true;
  const total = questions.length;
  const progress = Math.round((index / Math.max(1, total)) * 100);

  const next = () => {
    if (index < total - 1) {
      setIndex((i) => i + 1);
    } else {
      startTransition(async () => {
        const res = await submitSurvey({ surveyId, userId, answers });
        if (res.ok) {
          setTriggered(res.triggered ?? []);
          setSubmitted(true);
          toast({
            title: "Survey submitted",
            description:
              (res.triggered?.length ?? 0) > 0
                ? `${res.triggered?.length} follow-up course${res.triggered?.length === 1 ? "" : "s"} auto-assigned.`
                : "Thanks — nothing additional is required.",
            variant: "success",
          });
          router.refresh();
        }
      });
    }
  };

  if (submitted) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-semibold">Survey complete</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {triggered.length > 0
            ? `Based on your answers, ${triggered.length} course${triggered.length === 1 ? " was" : "s were"} added to your training. They'll appear in your dashboard.`
            : "Thanks — no additional training is required."}
        </p>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <FileCheck2 className="h-3 w-3" /> {title}
        </span>
        <span>
          Question {index + 1} of {total}
        </span>
      </div>
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h3 className="font-display text-xl font-semibold tracking-tight">{q.prompt}</h3>
      <div className="mt-5 space-y-2">
        {q.options.map((o) => {
          const selected = answers[q.id] === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: o.id }))}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition",
                selected
                  ? "border-primary/70 bg-primary/10 shadow-sm ring-2 ring-primary/20"
                  : "hover:border-primary/40 hover:bg-accent/40"
              )}
            >
              <span className="font-medium">{o.label}</span>
              {o.triggersCourseTitle && (
                <Badge variant="outline" className="text-[10px]">
                  triggers {o.triggersCourseTitle}
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          disabled={index === 0 || pending}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
        >
          Back
        </Button>
        <Button onClick={next} disabled={!answered || pending}>
          {index < total - 1 ? "Next" : pending ? "Submitting…" : "Submit survey"} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
