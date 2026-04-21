"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth";
import { db, supabaseEnabled } from "@/lib/db";
import {
  assignments,
  auditLog,
  certificates,
  courses,
  getCourseById,
  getOrgBySlug,
  getUserById,
  getWorkspaceById,
  learningPaths,
  smartGroups,
  surveys,
  users,
} from "@/lib/data";
import type {
  AiSuggestion,
  AssignmentMethod,
  Course,
  CourseType,
  LearningPath,
  PathNode,
  PathEdge,
  SmartGroup,
  SmartGroupCondition,
} from "@/lib/types";

/**
 * Each mutation below writes to the in-memory seed store (keeps reads fast
 * and demo-stable) and, when USE_SUPABASE=true, mirrors the change into
 * Postgres via the db adapter. Supabase errors are logged but never block
 * the UI — the in-memory write always succeeds first.
 */
function mirror(task: Promise<{ ok: boolean; reason?: string }>, label: string): void {
  if (!supabaseEnabled()) return;
  task
    .then((r) => {
      if (!r.ok && r.reason !== "memory") {
        console.warn(`[supabase:${label}]`, r.reason);
      }
    })
    .catch((e) => console.warn(`[supabase:${label}] threw`, e));
}

// NOTE: all data lives in `src/lib/data.ts` arrays which are module-scoped and
// mutable. In a single running Node process (dev, most Netlify warm starts)
// mutations persist across requests. Cold restarts reset to seed data. The
// Supabase adapter in `src/lib/db.ts` is a drop-in upgrade when you're ready.

function actorId(): string | null {
  // Synchronous cookies() is available in Next 15 server actions.
  // This is a server-only module ("use server"), so this is fine.
  const store = cookiesSync();
  return store?.get(AUTH_COOKIE)?.value ?? null;
}

function cookiesSync() {
  try {
    // In server actions `cookies()` returns a ReadonlyRequestCookies instance
    // directly on Node runtime (Next 15). We fall back to `null` if the
    // helper isn't available (e.g. during static analysis).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (cookies as unknown as () => any)();
  } catch {
    return null;
  }
}

function audit(action: string, target?: string, meta?: Record<string, unknown>) {
  const uid = actorId();
  if (!uid) return;
  const actor = getUserById(uid);
  auditLog.unshift({
    id: `al_${Math.random().toString(36).slice(2)}`,
    orgId: actor?.orgId ?? "__platform__",
    actorId: uid,
    action,
    target,
    createdAt: new Date().toISOString(),
    meta,
  });
  mirror(
    db.appendAudit({
      orgId: actor?.orgId,
      actorId: uid,
      action,
      target,
      meta,
    }),
    "audit"
  );
}

// --------------------- Courses ---------------------

export async function createCourse(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "");
  const workspaceId = String(formData.get("workspaceId") ?? "");
  const type = String(formData.get("type") ?? "authored") as CourseType;
  const title = String(formData.get("title") ?? "Untitled course");
  const summary = String(formData.get("summary") ?? "");
  const duration = Number(formData.get("durationMinutes") ?? 20);
  const required = formData.get("required") === "on";
  const orgSlug = String(formData.get("orgSlug") ?? "");
  const wsSlug = String(formData.get("wsSlug") ?? "");

  const dbId = crypto.randomUUID();
  const course: Course = {
    id: dbId,
    orgId,
    workspaceId,
    title,
    summary,
    description: summary,
    type,
    category: "General",
    tags: [],
    durationMinutes: Math.max(1, duration),
    thumbnailColor: "from-northstar-500/90 to-indigo-600/90",
    thumbnailEmoji: "✨",
    required,
    certificateEnabled: true,
    authors: actorId() ? [actorId()!] : [],
    published: false,
    updatedAt: new Date().toISOString(),
  };
  courses.push(course);
  mirror(
    db.insertCourse({
      dbId,
      orgId,
      workspaceId,
      type,
      title,
      summary,
      description: summary,
      durationMinutes: Math.max(1, duration),
      required,
      authorUserId: actorId() ?? undefined,
    }),
    "insertCourse"
  );
  audit("course.created", course.id, { title });
  if (orgSlug && wsSlug) revalidatePath(`/org/${orgSlug}/w/${wsSlug}/courses`);
  return { ok: true as const, id: course.id };
}

export async function updateCourse(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const course = getCourseById(id);
  if (!course) return { ok: false as const, error: "Course not found" };
  const next = {
    ...course,
    title: String(formData.get("title") ?? course.title),
    summary: String(formData.get("summary") ?? course.summary),
    description: String(formData.get("description") ?? course.description),
    required: formData.get("required") === "on",
    published: formData.get("published") === "on",
    updatedAt: new Date().toISOString(),
  };
  const i = courses.findIndex((c) => c.id === id);
  if (i >= 0) courses[i] = next;
  mirror(db.updateCourse(id, next), "updateCourse");
  audit("course.updated", id);
  const ws = getWorkspaceById(course.workspaceId);
  const org = users.find((u) => u.orgId === course.orgId); // not used for slug resolution
  void org;
  if (ws) revalidatePath(`/org/${course.orgId}/w/${ws.slug}/courses/${id}`);
  return { ok: true as const };
}

export async function publishCourse(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const i = courses.findIndex((c) => c.id === id);
  if (i < 0) return { ok: false as const };
  courses[i] = { ...courses[i], published: true, updatedAt: new Date().toISOString() };
  mirror(db.publishCourse(id), "publishCourse");
  audit("course.published", id);
  revalidatePath("/", "layout");
  return { ok: true as const };
}

// --------------------- Learning paths ---------------------

export async function createPath(formData: FormData) {
  const orgId = String(formData.get("orgId") ?? "");
  const workspaceId = formData.get("workspaceId") ? String(formData.get("workspaceId")) : undefined;
  const name = String(formData.get("name") ?? "Untitled path");
  const audience = String(formData.get("audience") ?? "");
  const required = formData.get("required") === "on";
  const credential = formData.get("credentialOnComplete") === "on";

  const dbId = crypto.randomUUID();
  const path: LearningPath = {
    id: dbId,
    orgId,
    workspaceId,
    name,
    summary: audience ? `For ${audience}` : "",
    audience,
    coverAccent: "northstar",
    certificateOnComplete: credential,
    required,
    published: false,
    updatedAt: new Date().toISOString(),
    assignedCount: 0,
    completionRate: 0,
    nodes: [
      { id: "n1", kind: "checkpoint", title: "Kickoff", x: 12, y: 50, required: true },
      { id: "n2", kind: "credential", title: `${name} Credential`, x: 86, y: 50, required: true },
    ],
    edges: [{ id: "e1", from: "n1", to: "n2" }],
  };
  learningPaths.push(path);
  mirror(
    db.insertPath({
      dbId,
      orgId,
      workspaceId,
      name,
      audience,
      required,
      certificateOnComplete: credential,
    }),
    "insertPath"
  );
  audit("learning_path.created", path.id, { name });
  revalidatePath("/", "layout");
  return { ok: true as const, id: path.id };
}

export async function updatePathStructure(args: {
  pathId: string;
  nodes: PathNode[];
  edges: PathEdge[];
}) {
  const i = learningPaths.findIndex((p) => p.id === args.pathId);
  if (i < 0) return { ok: false as const };
  learningPaths[i] = {
    ...learningPaths[i],
    nodes: args.nodes,
    edges: args.edges,
    updatedAt: new Date().toISOString(),
  };
  audit("learning_path.updated", args.pathId);
  revalidatePath("/", "layout");
  return { ok: true as const };
}

// --------------------- Smart groups ---------------------

export async function createSmartGroup(args: {
  orgId: string;
  workspaceId?: string;
  name: string;
  description: string;
  conditions: SmartGroupCondition[];
  memberCount: number;
}) {
  const dbId = crypto.randomUUID();
  const g: SmartGroup = {
    id: dbId,
    orgId: args.orgId,
    workspaceId: args.workspaceId,
    name: args.name,
    description: args.description,
    conditions: args.conditions,
    memberCount: args.memberCount,
  };
  smartGroups.push(g);
  mirror(
    db.insertSmartGroup({
      dbId,
      orgId: args.orgId,
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      conditions: args.conditions,
      memberCount: args.memberCount,
    }),
    "insertSmartGroup"
  );
  audit("smart_group.created", g.id, { name: args.name });
  revalidatePath("/", "layout");
  return { ok: true as const, id: g.id };
}

// --------------------- Assignments ---------------------

export async function assignCourse(args: {
  courseId: string;
  userIds: string[];
  method: AssignmentMethod;
  source?: string;
  dueAt?: string;
}) {
  let created = 0;
  for (const uid of args.userIds) {
    const existing = assignments.find(
      (a) => a.userId === uid && a.courseId === args.courseId && a.status !== "completed"
    );
    if (existing) continue;
    const dbId = crypto.randomUUID();
    assignments.push({
      id: dbId,
      userId: uid,
      courseId: args.courseId,
      status: "not_started",
      progress: 0,
      assignedAt: new Date().toISOString(),
      method: args.method,
      source: args.source,
      dueAt: args.dueAt,
    });
    mirror(
      db.insertAssignment({
        dbId,
        userId: uid,
        courseId: args.courseId,
        method: args.method,
        source: args.source,
        dueAt: args.dueAt,
      }),
      "insertAssignment"
    );
    created++;
  }
  audit("assignments.created", args.courseId, { count: created, method: args.method });
  revalidatePath("/", "layout");
  return { ok: true as const, created };
}

export async function completeCourse(args: { userId: string; courseId: string; score?: number }) {
  const course = getCourseById(args.courseId);
  if (!course) return { ok: false as const };
  const now = new Date();
  const expiresAt = course.renewalMonths
    ? new Date(now.getFullYear(), now.getMonth() + course.renewalMonths, now.getDate()).toISOString()
    : undefined;

  const i = assignments.findIndex((a) => a.userId === args.userId && a.courseId === args.courseId);
  if (i >= 0) {
    assignments[i] = {
      ...assignments[i],
      status: "completed",
      progress: 1,
      completedAt: now.toISOString(),
      expiresAt,
      score: args.score,
    };
  } else {
    assignments.push({
      id: `a_${Math.random().toString(36).slice(2, 8)}`,
      userId: args.userId,
      courseId: args.courseId,
      status: "completed",
      progress: 1,
      assignedAt: now.toISOString(),
      completedAt: now.toISOString(),
      expiresAt,
      method: "self",
      score: args.score,
    });
  }

  mirror(
    db.markComplete({
      userId: args.userId,
      courseId: args.courseId,
      expiresAt,
      score: args.score,
    }),
    "markComplete"
  );
  if (course.certificateEnabled) {
    const certDbId = crypto.randomUUID();
    const credentialCode = `NS-${course.id.toUpperCase().slice(0, 6)}-${Math.floor(Math.random() * 9000) + 1000}`;
    certificates.push({
      id: certDbId,
      userId: args.userId,
      courseId: args.courseId,
      issuedAt: now.toISOString(),
      expiresAt,
      credentialCode,
      pdfTemplate: "default",
      status: "active",
    });
    mirror(
      db.insertCertificate({
        dbId: certDbId,
        userId: args.userId,
        courseId: args.courseId,
        credentialCode,
        expiresAt,
      }),
      "insertCertificate"
    );
  }

  audit("course.completed", args.courseId, { userId: args.userId });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function signAttestation(args: { userId: string; courseId: string; signature: string }) {
  await completeCourse({ userId: args.userId, courseId: args.courseId });
  audit("attestation.signed", args.courseId, { userId: args.userId, signature: args.signature });
  revalidatePath("/", "layout");
  return { ok: true as const };
}

// --------------------- Surveys ---------------------

export async function submitSurvey(args: {
  surveyId: string;
  userId: string;
  answers: Record<string, string>;
}) {
  const survey = surveys.find((s) => s.id === args.surveyId);
  if (!survey) return { ok: false as const };
  const triggered: string[] = [];
  for (const q of survey.questions) {
    const picked = args.answers[q.id];
    const option = q.options.find((o) => o.id === picked);
    if (option?.triggersCourseId) {
      triggered.push(option.triggersCourseId);
    }
  }
  for (const cid of triggered) {
    const existing = assignments.find(
      (a) => a.userId === args.userId && a.courseId === cid && a.status !== "completed"
    );
    if (existing) continue;
    assignments.push({
      id: crypto.randomUUID(),
      userId: args.userId,
      courseId: cid,
      status: "not_started",
      progress: 0,
      assignedAt: new Date().toISOString(),
      method: "survey",
      source: `Survey: ${survey.title}`,
    });
  }
  mirror(
    db.recordSurveyAssignments({
      userId: args.userId,
      surveyId: args.surveyId,
      triggeredCourseIds: triggered,
    }),
    "recordSurveyAssignments"
  );
  audit("survey.submitted", args.surveyId, { userId: args.userId, triggered: triggered.length });
  revalidatePath("/", "layout");
  return { ok: true as const, triggered };
}

// --------------------- AI grooming (fake) ---------------------

export async function runGroomingJob(args: { orgId: string; workspaceId: string }) {
  // Pulls random (user, course) pairs from the org/workspace that don't
  // already have an assignment or pending suggestion. In a real build this
  // calls an LLM with the course AI context + employee profile.
  const org = args.orgId;
  const ws = args.workspaceId;
  const wsCourses = courses.filter((c) => c.orgId === org && c.workspaceId === ws && c.published);
  const orgUsers = users.filter((u) => u.orgId === org);
  let created = 0;
  for (const c of wsCourses.slice(0, 2)) {
    for (const u of orgUsers.slice(0, 4)) {
      const hasAssignment = assignments.some((a) => a.userId === u.id && a.courseId === c.id);
      if (hasAssignment) continue;
      const dbId = crypto.randomUUID();
      const confidence = 0.65 + Math.random() * 0.3;
      const evidence = [
        `Title: ${u.employee?.title ?? "—"}`,
        `Department: ${u.employee?.department ?? "—"}`,
        `Course: ${c.title}`,
      ];
      const reason = `Profile match: ${u.employee?.title ?? "role"} aligns with course AI context`;
      const sug: AiSuggestion = {
        id: dbId,
        orgId: org,
        workspaceId: ws,
        courseId: c.id,
        userId: u.id,
        reason,
        confidence,
        createdAt: new Date().toISOString(),
        status: "pending",
        evidence,
      };
      // Avoid dupes in our own queue
      const { aiSuggestions } = await import("@/lib/data");
      if (!aiSuggestions.some((s) => s.userId === u.id && s.courseId === c.id && s.status === "pending")) {
        aiSuggestions.push(sug);
        mirror(
          db.insertAiSuggestion({
            dbId,
            orgId: org,
            workspaceId: ws,
            courseId: c.id,
            userId: u.id,
            reason,
            confidence,
            evidence,
          }),
          "insertAiSuggestion"
        );
        created++;
      }
    }
  }
  audit("ai.grooming_job_run", `${org}/${ws}`, { created });
  revalidatePath("/", "layout");
  return { ok: true as const, created };
}

export async function approveAiSuggestion(args: { suggestionId: string }) {
  const { aiSuggestions } = await import("@/lib/data");
  const s = aiSuggestions.find((x) => x.id === args.suggestionId);
  if (!s || !s.courseId) return { ok: false as const };
  await assignCourse({
    courseId: s.courseId,
    userIds: [s.userId],
    method: "ai",
    source: s.reason,
  });
  s.status = "approved";
  mirror(db.updateAiSuggestionStatus(s.id, "approved"), "ai.approve");
  audit("ai.suggestion_approved", s.id);
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function rejectAiSuggestion(args: { suggestionId: string }) {
  const { aiSuggestions } = await import("@/lib/data");
  const s = aiSuggestions.find((x) => x.id === args.suggestionId);
  if (!s) return { ok: false as const };
  s.status = "rejected";
  mirror(db.updateAiSuggestionStatus(s.id, "rejected"), "ai.reject");
  audit("ai.suggestion_rejected", s.id);
  revalidatePath("/", "layout");
  return { ok: true as const };
}

// --------------------- Reminders ---------------------

export async function sendReminder(args: {
  userIds: string[];
  courseId?: string;
  template: "due_soon" | "overdue" | "encouragement";
}) {
  audit("notification.sent", args.courseId, {
    template: args.template,
    recipients: args.userIds.length,
  });
  revalidatePath("/", "layout");
  return { ok: true as const, sent: args.userIds.length };
}

// --------------------- Utility ---------------------

export async function _revalidateAll() {
  revalidatePath("/", "layout");
}
