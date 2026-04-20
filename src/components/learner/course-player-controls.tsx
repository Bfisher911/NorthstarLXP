"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Confetti } from "@/components/ui/confetti";
import { useToast } from "@/components/ui/toast";
import { completeCourse } from "@/app/actions/mutations";

/**
 * Interactive progress + complete control for the course player page. Clicking
 * "Continue" advances progress in increments; at 100% the user can mark the
 * course complete, which fires the confetti burst and a success toast.
 */
export function CoursePlayerControls({
  initialProgress,
  alreadyCompleted,
  courseTitle,
  nextUpHref,
  userId,
  courseId,
}: {
  initialProgress: number; // 0-100
  alreadyCompleted?: boolean;
  courseTitle: string;
  nextUpHref?: string;
  userId?: string;
  courseId?: string;
}) {
  const [progress, setProgress] = React.useState(initialProgress);
  const [completed, setCompleted] = React.useState(!!alreadyCompleted);
  const [fire, setFire] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const advance = () => {
    setProgress((p) => {
      const next = Math.min(100, Math.max(p + 25, p));
      return next;
    });
  };

  const markComplete = () => {
    setCompleted(true);
    setProgress(100);
    setFire(true);
    if (userId && courseId) {
      startTransition(async () => {
        await completeCourse({ userId, courseId });
        router.refresh();
      });
    }
    toast({
      title: "🎉 Course complete",
      description: `${courseTitle} — nice work. Credential awarded.`,
      variant: "success",
    });
  };

  return (
    <div className="space-y-4">
      <Confetti fire={fire} onDone={() => setFire(false)} />

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Completion</span>
        <span className="font-semibold">{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} />

      {completed ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="font-medium">Completed — your certificate is ready.</span>
          </div>
          {nextUpHref && (
            <Button className="w-full" asChild>
              <Link href={nextUpHref}>
                Next up in your journey <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      ) : progress >= 100 ? (
        <Button className="w-full" onClick={markComplete} size="lg" disabled={pending}>
          <CheckCircle2 className="h-4 w-4" /> {pending ? "Saving…" : "Mark complete"}
        </Button>
      ) : (
        <Button className="w-full" onClick={advance} size="lg">
          <PlayCircle className="h-4 w-4" />
          {progress > 0 ? "Continue" : "Start course"}
        </Button>
      )}
    </div>
  );
}
