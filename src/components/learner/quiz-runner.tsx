"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/types";

/**
 * Interactive quiz player. Single-answer and true/false only for now (multi
 * can be added when any course needs it). Learner must answer every question;
 * grading happens on submit, with per-question feedback. When the learner
 * clears the pass threshold the `onPass` callback fires so the parent can
 * mark the module complete.
 */
export function QuizRunner({
  questions,
  passThreshold = 0.8,
  onPass,
}: {
  questions: QuizQuestion[];
  passThreshold?: number;
  onPass?: () => void;
}) {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [submitted, setSubmitted] = React.useState(false);

  const allAnswered = questions.every((q) => answers[q.id]);

  const score = React.useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    for (const q of questions) {
      const picked = q.options.find((o) => o.id === answers[q.id]);
      if (picked?.correct) correct++;
    }
    return correct;
  }, [answers, questions, submitted]);

  const pct = questions.length === 0 ? 0 : score / questions.length;
  const passed = pct >= passThreshold;

  const onceRef = React.useRef(false);
  React.useEffect(() => {
    if (submitted && passed && !onceRef.current) {
      onceRef.current = true;
      onPass?.();
    }
  }, [submitted, passed, onPass]);

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    onceRef.current = false;
  };

  return (
    <div className="space-y-5">
      {questions.map((q, qi) => (
        <div key={q.id} className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-start gap-2">
            <Badge variant="secondary">Q{qi + 1}</Badge>
            <div className="text-sm font-semibold">{q.prompt}</div>
          </div>
          <div className="space-y-2">
            {q.options.map((o) => {
              const picked = answers[q.id] === o.id;
              const showCorrect = submitted && o.correct;
              const showWrong = submitted && picked && !o.correct;
              return (
                <label
                  key={o.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border px-3 py-2 text-sm transition",
                    picked && !submitted && "border-primary/60 bg-primary/5",
                    showCorrect && "border-emerald-500/60 bg-emerald-500/10",
                    showWrong && "border-rose-500/60 bg-rose-500/10",
                    !picked && !submitted && "hover:bg-accent/60"
                  )}
                >
                  <input
                    type="radio"
                    name={q.id}
                    value={o.id}
                    checked={picked}
                    disabled={submitted}
                    onChange={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                  />
                  <span className="flex-1">{o.label}</span>
                  {showCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />}
                  {showWrong && <XCircle className="h-4 w-4 shrink-0 text-rose-500" />}
                </label>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <div className="mt-3 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Why:</span> {q.explanation}
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <Button
          size="lg"
          className="w-full"
          disabled={!allAnswered}
          onClick={() => setSubmitted(true)}
        >
          {allAnswered
            ? "Submit answers"
            : `Answer ${questions.length - Object.keys(answers).length} more to submit`}
        </Button>
      ) : (
        <div
          className={cn(
            "rounded-xl border p-4",
            passed
              ? "border-emerald-500/50 bg-emerald-500/10"
              : "border-amber-500/50 bg-amber-500/10"
          )}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-lg font-semibold">
                {passed ? "Passed" : "Below threshold"}
              </div>
              <div className="text-xs text-muted-foreground">
                {score} of {questions.length} correct · {Math.round(pct * 100)}% ·{" "}
                threshold {Math.round(passThreshold * 100)}%
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!passed && (
                <Button variant="outline" onClick={reset}>
                  <RotateCcw className="h-4 w-4" /> Retake
                </Button>
              )}
              {passed && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Module complete
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
