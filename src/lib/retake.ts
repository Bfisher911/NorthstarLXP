import type { Assignment, Course } from "./types";

/**
 * Retake / review state for a given learner-on-a-course pairing. Derived
 * from the course's author-chosen policy plus the current assignment.
 *
 * - `first`       — learner has never completed the course. Normal "Start
 *                   course" → "Mark complete" flow.
 * - `retake_open` — learner has completed the course and may retake now.
 *                   Completing refreshes the compliance date & certificate.
 * - `review`      — learner has completed the course and can re-read / re-
 *                   attempt quizzes, but the completion date is locked.
 *                   Retake is either disabled (review_only) or gated until
 *                   the retake window opens (window_only, pre-window).
 */
export type CourseEngagementMode = "first" | "retake_open" | "review";

export interface EngagementState {
  mode: CourseEngagementMode;
  /** When true, finishing the course writes a fresh completion + cert. */
  writesCompletion: boolean;
  /** Human text to explain what finishing will do. */
  modeLabel: string;
  modeHint: string;
  /** For window_only policies, the timestamp the retake window opens. */
  retakeWindowOpensAt?: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function getEngagementState(
  course: Course,
  assignment: Assignment | undefined,
  now: Date = new Date()
): EngagementState {
  const policy = course.retakePolicy ?? "window_only";
  const windowDays = course.retakeWindowDays ?? 30;

  if (!assignment || assignment.status !== "completed") {
    return {
      mode: "first",
      writesCompletion: true,
      modeLabel: "Start course",
      modeHint: "Completing will issue a new certificate and set your compliance date.",
    };
  }

  // Already completed — decide between retake / review.
  const expiresAt = assignment.expiresAt ? new Date(assignment.expiresAt) : null;
  const expired = expiresAt ? expiresAt.getTime() < now.getTime() : false;

  if (policy === "review_only") {
    return {
      mode: "review",
      writesCompletion: false,
      modeLabel: "Review mode",
      modeHint:
        "This course is review-only after completion. Your compliance date is locked; retakes don't update it.",
    };
  }

  if (policy === "anytime") {
    return {
      mode: "retake_open",
      writesCompletion: true,
      modeLabel: "Retake available",
      modeHint:
        "The author allows retakes anytime. Completing again will refresh your compliance date and certificate.",
    };
  }

  // window_only — retake opens windowDays before expiry (and stays open after expiry).
  if (!expiresAt) {
    return {
      mode: "retake_open",
      writesCompletion: true,
      modeLabel: "Retake available",
      modeHint: "Completing will refresh your compliance date and certificate.",
    };
  }

  const windowOpensAt = new Date(expiresAt.getTime() - windowDays * MS_PER_DAY);
  const windowOpen = now.getTime() >= windowOpensAt.getTime() || expired;

  if (windowOpen) {
    return {
      mode: "retake_open",
      writesCompletion: true,
      modeLabel: expired ? "Retake required" : "Retake window open",
      modeHint: expired
        ? "Your compliance date has expired. Completing the retake restores your certificate."
        : `Retake window is open — you're within ${windowDays} days of expiry. Completing refreshes your compliance date.`,
      retakeWindowOpensAt: windowOpensAt.toISOString(),
    };
  }

  return {
    mode: "review",
    writesCompletion: false,
    modeLabel: "Review mode",
    modeHint: `Retake window opens ${windowDays} days before expiry. You can review freely — your compliance date stays at the last completion.`,
    retakeWindowOpensAt: windowOpensAt.toISOString(),
  };
}
