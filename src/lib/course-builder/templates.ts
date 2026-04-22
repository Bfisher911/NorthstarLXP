import type { CourseModule, QuizQuestion } from "@/lib/types";

/**
 * Starter templates for new modules. Offered via the "+ Add module" menu
 * in the builder so authors don't face a blank textarea every time.
 */

function randomId() {
  return Math.random().toString(36).slice(2, 10);
}

export interface ModuleTemplate {
  id: string;
  label: string;
  description: string;
  make: () => CourseModule;
}

const blankLesson = (title = "New lesson"): CourseModule => ({
  id: randomId(),
  title,
  type: "lesson",
  durationMinutes: 5,
  body: "## Section heading\n\nStart typing your lesson body.",
});

const sampleQuestions = (): QuizQuestion[] => [
  {
    id: randomId(),
    prompt: "Pick the statement that best matches what you just read.",
    type: "single",
    options: [
      { id: randomId(), label: "Option A", correct: true },
      { id: randomId(), label: "Option B" },
      { id: randomId(), label: "Option C" },
      { id: randomId(), label: "Option D" },
    ],
    explanation: "A explanation of why A is correct goes here.",
  },
  {
    id: randomId(),
    prompt: "True or False: a placeholder knowledge check.",
    type: "true_false",
    options: [
      { id: randomId(), label: "True", correct: true },
      { id: randomId(), label: "False" },
    ],
    explanation: "Why the correct answer is correct.",
  },
  {
    id: randomId(),
    prompt: "Another single-choice check to round out the quiz.",
    type: "single",
    options: [
      { id: randomId(), label: "Option A" },
      { id: randomId(), label: "Option B", correct: true },
      { id: randomId(), label: "Option C" },
    ],
    explanation: "Explain the answer.",
  },
];

export const LESSON_TEMPLATES: ModuleTemplate[] = [
  {
    id: "lesson-blank",
    label: "Blank lesson",
    description: "A single heading + one paragraph to start from.",
    make: () => blankLesson(),
  },
  {
    id: "lesson-objectives",
    label: "Objectives lesson",
    description: "Intro paragraph + bulleted learning objectives.",
    make: () => ({
      ...blankLesson("Learning objectives"),
      body: `After this section, learners should be able to:\n\n- First objective\n- Second objective\n- Third objective\n\n> Tip: keep each objective concrete and testable.`,
    }),
  },
  {
    id: "lesson-concept",
    label: "Concept + example",
    description: "Heading, definition, and a real-world example.",
    make: () => ({
      ...blankLesson("Core concept"),
      body: `## The core idea\n\nDefine the concept in one sentence.\n\n### Why it matters\n\nA paragraph explaining stakes and consequences.\n\n### Example\n\n> A short story or scenario from the learner's actual work.`,
    }),
  },
  {
    id: "lesson-decision-table",
    label: "Decision table",
    description: "Lesson heading + a two-column decision table.",
    make: () => ({
      ...blankLesson("When to act"),
      body: `## Decision table\n\nUse this table to decide what to do in each situation.\n\n| Situation | Do this |\n| --- | --- |\n| Condition A | Action A |\n| Condition B | Action B |\n| Condition C | Action C |`,
    }),
  },
  {
    id: "lesson-checklist",
    label: "Five-step checklist",
    description: "A numbered five-step procedure.",
    make: () => ({
      ...blankLesson("Step-by-step procedure"),
      body: `Follow these steps in order. Do not skip.\n\n1. Step one — what and why\n2. Step two — what and why\n3. Step three — what and why\n4. Step four — what and why\n5. Step five — what and why`,
    }),
  },
];

export const QUIZ_TEMPLATES: ModuleTemplate[] = [
  {
    id: "quiz-3q",
    label: "Three-question knowledge check",
    description: "One single-choice, one T/F, one single-choice.",
    make: () => ({
      id: randomId(),
      title: "Knowledge check",
      type: "quiz",
      durationMinutes: 5,
      questions: sampleQuestions(),
    }),
  },
  {
    id: "quiz-scenario",
    label: "Scenario-based quiz",
    description: "One situational question with four plausible options.",
    make: () => ({
      id: randomId(),
      title: "Scenario",
      type: "quiz",
      durationMinutes: 3,
      questions: [
        {
          id: randomId(),
          prompt:
            "You're faced with a realistic scenario in your role. Which action do you take first?",
          type: "single",
          options: [
            { id: randomId(), label: "Correct choice — the recommended first action", correct: true },
            { id: randomId(), label: "A plausible but incorrect action" },
            { id: randomId(), label: "Another plausible but incorrect action" },
            { id: randomId(), label: "A clearly wrong action" },
          ],
          explanation: "Explain the reasoning and any regulatory basis.",
        },
      ],
    }),
  },
];

export const GENERIC_TEMPLATES: Partial<Record<CourseModule["type"], ModuleTemplate>> = {
  video: {
    id: "video",
    label: "Video",
    description: "A video module with a short description.",
    make: () => ({
      id: randomId(),
      title: "New video",
      type: "video",
      durationMinutes: 5,
      body: "Describe what this video covers. Transcript can go here.",
    }),
  },
  checkpoint: {
    id: "checkpoint",
    label: "Checkpoint",
    description: "A short reflection or action item.",
    make: () => ({
      id: randomId(),
      title: "Checkpoint",
      type: "checkpoint",
      durationMinutes: 2,
      body: "Take a moment to reflect on what you've read and note one change you'll make.",
    }),
  },
  attestation: {
    id: "attestation",
    label: "Attestation",
    description: "A statement the learner must sign.",
    make: () => ({
      id: randomId(),
      title: "Attestation",
      type: "attestation",
      durationMinutes: 2,
      body: "I have read and understand the policy, and agree to abide by it.",
    }),
  },
  file: {
    id: "file",
    label: "File / reference",
    description: "Link or describe a downloadable resource.",
    make: () => ({
      id: randomId(),
      title: "Reference",
      type: "file",
      durationMinutes: 1,
      body: "Describe the downloadable resource and how it supports the course.",
    }),
  },
};

/** Stub AI quiz generator. Picks tokens from a lesson body to fake a draft quiz. */
export function generateQuizFromLesson(body: string, count = 3): QuizQuestion[] {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && !l.startsWith("#") && !l.startsWith(">"));
  const out: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const src = lines[i % Math.max(1, lines.length)] ?? "Core concept from this lesson";
    const stem = src.slice(0, 120).replace(/\*\*/g, "");
    out.push({
      id: randomId(),
      prompt: `Based on the lesson, which statement is most accurate about: "${stem}…"?`,
      type: "single",
      options: [
        {
          id: randomId(),
          label: "A correct paraphrase of the lesson — edit me to match the source.",
          correct: true,
        },
        { id: randomId(), label: "A plausible distractor — edit me." },
        { id: randomId(), label: "Another plausible distractor — edit me." },
        { id: randomId(), label: "An obviously wrong option — edit me." },
      ],
      explanation: "Explain why the correct answer is correct (edit this placeholder).",
    });
  }
  return out;
}
