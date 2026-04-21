"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileText,
  HelpCircle,
  ListChecks,
  PlayCircle,
  ShieldCheck,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Confetti } from "@/components/ui/confetti";
import { useToast } from "@/components/ui/toast";
import { completeCourse } from "@/app/actions/mutations";
import { cn } from "@/lib/utils";
import { LessonProse } from "@/components/learner/lesson-prose";
import { QuizRunner } from "@/components/learner/quiz-runner";
import type { QuizQuestion } from "@/lib/types";

export interface PlayerModule {
  id: string;
  title: string;
  type: "lesson" | "video" | "quiz" | "checkpoint" | "attestation" | "file";
  durationMinutes?: number;
  body?: string;
  questions?: QuizQuestion[];
}

const moduleIcon = {
  lesson: FileText,
  video: Video,
  quiz: HelpCircle,
  checkpoint: ListChecks,
  attestation: ShieldCheck,
  file: FileText,
} as const;

/**
 * Steps a learner through the real module list of a course. "Continue"
 * advances to the next module; the final module shows "Mark complete" which
 * fires confetti + writes a completion + credential. When there are no
 * authored modules (SCORM, live, policy, survey, evidence-task) we fall
 * back to a single virtual module so the button still behaves sensibly.
 */
export function CoursePlayerControls({
  initialProgress,
  alreadyCompleted,
  courseTitle,
  nextUpHref,
  userId,
  courseId,
  modules,
  engagementMode = "first",
}: {
  initialProgress: number; // 0-100
  alreadyCompleted?: boolean;
  courseTitle: string;
  nextUpHref?: string;
  userId?: string;
  courseId?: string;
  modules?: PlayerModule[];
  /**
   * first       — initial completion; writes compliance date + cert
   * retake_open — re-completion writes fresh compliance date + cert
   * review      — finishing is a no-op for compliance; learner just re-reads
   */
  engagementMode?: "first" | "retake_open" | "review";
}) {
  const effectiveModules: PlayerModule[] =
    modules && modules.length > 0
      ? modules
      : [{ id: "__only__", title: courseTitle, type: "lesson" }];

  const total = effectiveModules.length;

  // Derive the starting module index from the stored progress.
  const initialIndex = Math.min(
    total - 1,
    Math.max(0, Math.floor((initialProgress / 100) * total))
  );

  // Retake and review start the walkthrough fresh even though the learner
  // has an existing completion. "First" short-circuits to the done state if
  // the learner was already marked completed (which shouldn't happen because
  // the parent routes completed learners to retake/review mode, but we keep
  // the fallback).
  const startsCompleted = engagementMode === "first" && !!alreadyCompleted;

  const [activeIndex, setActiveIndex] = React.useState(initialIndex);
  const [doneIndices, setDoneIndices] = React.useState<Set<number>>(
    () => new Set(startsCompleted ? effectiveModules.map((_, i) => i) : [])
  );
  const [completed, setCompleted] = React.useState(startsCompleted);
  const [fire, setFire] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const progressPct = completed
    ? 100
    : Math.round((doneIndices.size / total) * 100);
  const active = effectiveModules[activeIndex];
  const isLastModule = activeIndex === total - 1;
  const isActiveDone = doneIndices.has(activeIndex);

  const markActiveDoneAndAdvance = () => {
    setDoneIndices((prev) => {
      const next = new Set(prev);
      next.add(activeIndex);
      return next;
    });
    if (!isLastModule) {
      setActiveIndex((i) => Math.min(total - 1, i + 1));
    }
  };

  const markComplete = () => {
    setCompleted(true);
    setDoneIndices(new Set(effectiveModules.map((_, i) => i)));
    const isReview = engagementMode === "review";
    if (!isReview) setFire(true);
    if (userId && courseId) {
      startTransition(async () => {
        await completeCourse({
          userId,
          courseId,
          mode: isReview ? "review" : engagementMode === "retake_open" ? "retake" : "first",
        });
        router.refresh();
      });
    }
    toast({
      title: isReview
        ? "Review recorded"
        : engagementMode === "retake_open"
        ? "🎉 Retake submitted"
        : "🎉 Course complete",
      description: isReview
        ? `${courseTitle} review finished. Your compliance date was not changed.`
        : engagementMode === "retake_open"
        ? `${courseTitle} — fresh certificate issued, compliance date updated.`
        : `${courseTitle} — nice work. Credential awarded.`,
      variant: "success",
    });
  };

  const ActiveIcon = moduleIcon[active.type];

  return (
    <div className="space-y-4">
      <Confetti fire={fire} onDone={() => setFire(false)} />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Completion</span>
        <span className="font-semibold">{progressPct}%</span>
      </div>
      <Progress value={progressPct} />

      {/* Module stepper — visible progress, clickable to jump */}
      {total > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {effectiveModules.map((m, i) => {
            const done = doneIndices.has(i);
            const current = i === activeIndex;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveIndex(i)}
                title={m.title}
                className={cn(
                  "h-1.5 flex-1 min-w-[24px] rounded-full transition",
                  done
                    ? "bg-emerald-500"
                    : current
                    ? "bg-primary"
                    : "bg-muted hover:bg-muted-foreground/30"
                )}
                aria-label={`Module ${i + 1}: ${m.title}`}
              />
            );
          })}
        </div>
      )}

      {/* Current module card */}
      {!completed && (
        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ActiveIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Module {activeIndex + 1} of {total} · {active.type}
                {active.durationMinutes ? ` · ${active.durationMinutes} min` : ""}
              </div>
              <div className="mt-0.5 font-display text-xl font-semibold tracking-tight">
                {active.title}
              </div>
              {isActiveDone && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Completed
                </div>
              )}
            </div>
          </div>

          {active.type === "video" && (
            <div className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 aspect-video">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/40 backdrop-blur">
                  <PlayCircle className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-white/80">
                <span>Video · {active.durationMinutes ?? 0} min</span>
                <span>1× · CC</span>
              </div>
            </div>
          )}

          {active.type === "quiz" && active.questions && active.questions.length > 0 ? (
            <QuizRunner
              questions={active.questions}
              onPass={() => {
                setDoneIndices((prev) => {
                  const next = new Set(prev);
                  next.add(activeIndex);
                  return next;
                });
              }}
            />
          ) : active.body ? (
            <LessonProse body={active.body} />
          ) : null}
        </div>
      )}

      {completed ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">
              {engagementMode === "review"
                ? "Review finished. Your compliance date is unchanged."
                : engagementMode === "retake_open"
                ? "Retake submitted — your compliance date and certificate have been refreshed."
                : "Completed — your certificate is ready."}
            </span>
          </div>
          {nextUpHref && (
            <Button className="w-full" asChild>
              <Link href={nextUpHref}>
                Next up in your journey <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {activeIndex > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          {isLastModule ? (
            <Button
              className="flex-1"
              onClick={markComplete}
              size="lg"
              disabled={pending}
            >
              <CheckCircle2 className="h-4 w-4" />
              {pending
                ? "Saving…"
                : engagementMode === "review"
                ? "Finish review"
                : engagementMode === "retake_open"
                ? "Submit retake"
                : "Mark complete"}
            </Button>
          ) : (
            <Button className="flex-1" onClick={markActiveDoneAndAdvance} size="lg">
              <PlayCircle className="h-4 w-4" /> Next module <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
