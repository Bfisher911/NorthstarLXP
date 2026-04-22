import type { Course, CourseModule } from "@/lib/types";

export interface BuilderIssue {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  moduleId?: string;
  /** Scroll target: module id or settings section name. */
  scrollTo?: string;
}

/**
 * Lint checks on a course draft. Errors block publish; warnings surface but
 * don't. All checks are cheap — safe to run on every keystroke.
 */
export function validateDraft(draft: {
  title: string;
  summary: string;
  durationMinutes: number;
  learningObjectives: string[];
  modules: CourseModule[];
  published: boolean;
  certificateEnabled: boolean;
  renewalMonths: number | null;
}): BuilderIssue[] {
  const issues: BuilderIssue[] = [];

  if (!draft.title.trim()) {
    issues.push({
      id: "title",
      severity: "error",
      message: "Course title can't be empty.",
      scrollTo: "title",
    });
  }
  if (!draft.summary.trim()) {
    issues.push({
      id: "summary",
      severity: "warning",
      message: "Summary is shown on the catalog card — add one so learners know what this is.",
      scrollTo: "settings",
    });
  }
  if (draft.learningObjectives.filter((o) => o.trim()).length < 3) {
    issues.push({
      id: "objectives",
      severity: "warning",
      message: "Aim for at least three concrete learning objectives.",
      scrollTo: "settings",
    });
  }
  if (draft.modules.length === 0) {
    issues.push({
      id: "no-modules",
      severity: "error",
      message: "Add at least one module before publishing.",
    });
  }

  for (const m of draft.modules) {
    if (!m.title.trim()) {
      issues.push({
        id: `mod-title-${m.id}`,
        severity: "error",
        message: `A ${m.type} module is missing a title.`,
        moduleId: m.id,
        scrollTo: m.id,
      });
    }
    if (
      (m.type === "lesson" || m.type === "attestation" || m.type === "checkpoint") &&
      !(m.body ?? "").trim()
    ) {
      issues.push({
        id: `mod-body-${m.id}`,
        severity: "warning",
        message: `"${m.title || m.type}" has no body content.`,
        moduleId: m.id,
        scrollTo: m.id,
      });
    }
    if (m.type === "quiz") {
      const qs = m.questions ?? [];
      if (qs.length === 0) {
        issues.push({
          id: `quiz-empty-${m.id}`,
          severity: "error",
          message: `"${m.title}" quiz has no questions.`,
          moduleId: m.id,
          scrollTo: m.id,
        });
      }
      for (const q of qs) {
        if (!q.prompt.trim()) {
          issues.push({
            id: `q-prompt-${q.id}`,
            severity: "error",
            message: `"${m.title}" has a question with no prompt.`,
            moduleId: m.id,
            scrollTo: m.id,
          });
        }
        if (q.options.length < 2) {
          issues.push({
            id: `q-options-${q.id}`,
            severity: "error",
            message: `"${q.prompt.slice(0, 40)}…" needs at least two options.`,
            moduleId: m.id,
            scrollTo: m.id,
          });
        }
        if (!q.options.some((o) => o.correct)) {
          issues.push({
            id: `q-correct-${q.id}`,
            severity: "error",
            message: `"${q.prompt.slice(0, 40)}…" has no option marked correct.`,
            moduleId: m.id,
            scrollTo: m.id,
          });
        }
        if (!q.explanation?.trim()) {
          issues.push({
            id: `q-explain-${q.id}`,
            severity: "info",
            message: `Consider adding an answer explanation for "${q.prompt.slice(0, 40)}…".`,
            moduleId: m.id,
            scrollTo: m.id,
          });
        }
      }
    }
  }

  // Duration reconciliation
  const sum = draft.modules.reduce((s, m) => s + (m.durationMinutes ?? 0), 0);
  if (sum > 0 && Math.abs(sum - draft.durationMinutes) / Math.max(1, draft.durationMinutes) > 0.3) {
    issues.push({
      id: "duration-skew",
      severity: "info",
      message: `Course duration is set to ${draft.durationMinutes}m but modules add up to ${sum}m.`,
      scrollTo: "settings",
    });
  }

  if (draft.certificateEnabled && (draft.renewalMonths ?? 0) === 0) {
    issues.push({
      id: "cert-no-renewal",
      severity: "info",
      message: "Certificate is on but no renewal period — credentials won't ever expire.",
      scrollTo: "settings",
    });
  }

  return issues;
}

export function canPublish(course: Pick<Course, "title" | "modules"> & { errors: BuilderIssue[] }) {
  return !course.errors.some((i) => i.severity === "error");
}
