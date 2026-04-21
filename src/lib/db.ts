/**
 * Database adapter — the bridge to Supabase when USE_SUPABASE=true, and a
 * no-op when the app is running in pure-demo mode.
 *
 * Strategy:
 *   - Reads stay in the in-memory store (`src/lib/data.ts`) for speed and
 *     deterministic demo UX.
 *   - Every mutation in `src/app/actions/mutations.ts` calls both the
 *     in-memory array AND the corresponding helper here, so new rows
 *     persist to Postgres and survive process restarts.
 *   - IDs inside the app stay as readable demo strings. When we hit
 *     Supabase we translate through `supabase-ids.ts` → the UUID space
 *     used by the seed migrations.
 */

import { supabase, supabaseEnabled } from "./supabase";
import {
  courseIdToUuid,
  orgIdToUuid,
  pathIdToUuid,
  surveyIdToUuid,
  toUuid,
  userIdToUuid,
  workspaceIdToUuid,
} from "./supabase-ids";
import type { Course, LearningPath, SmartGroupCondition } from "./types";

type Ok = { ok: true };
type Err = { ok: false; reason: string };
type Result = Ok | Err;

function memoryOnly(): Err {
  return { ok: false, reason: "memory" };
}

// supabase-js query builders are `thenable` objects, not true Promises. Any
// value we can `await` is compatible here.
async function safe(fn: () => PromiseLike<unknown>): Promise<Result> {
  try {
    const res = await fn();
    const error = (res as { error?: { message: string } } | undefined)?.error;
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: String(err) };
  }
}

export const db = {
  enabled: supabaseEnabled(),

  // ---------- Courses ----------
  async insertCourse(input: {
    dbId: string; // fresh uuid assigned by the caller
    orgId: string;
    workspaceId: string;
    type: Course["type"];
    title: string;
    summary: string;
    description: string;
    durationMinutes: number;
    required: boolean;
    authorUserId?: string;
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const orgUuid = toUuid(orgIdToUuid, input.orgId);
    const wsUuid = toUuid(workspaceIdToUuid, input.workspaceId);
    const authorUuid = input.authorUserId ? toUuid(userIdToUuid, input.authorUserId) : null;
    if (!orgUuid || !wsUuid) return { ok: false, reason: "unknown org/workspace id" };
    return safe(() =>
      client.from("courses").insert({
        id: input.dbId,
        org_id: orgUuid,
        workspace_id: wsUuid,
        type: input.type,
        title: input.title,
        summary: input.summary,
        description: input.description,
        duration_minutes: input.durationMinutes,
        required: input.required,
        certificate_enabled: true,
        category: "General",
        thumbnail_color: "from-northstar-500/90 to-indigo-600/90",
        thumbnail_emoji: "✨",
        published: false,
        created_by: authorUuid,
        updated_at: new Date().toISOString(),
      })
    );
  },

  async updateCourse(demoCourseId: string, patch: Partial<Course>): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const courseUuid = toUuid(courseIdToUuid, demoCourseId);
    if (!courseUuid) return { ok: false, reason: "unknown course id" };
    const dbPatch: Record<string, unknown> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.summary !== undefined) dbPatch.summary = patch.summary;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.required !== undefined) dbPatch.required = patch.required;
    if (patch.published !== undefined) dbPatch.published = patch.published;
    dbPatch.updated_at = new Date().toISOString();
    return safe(() => client.from("courses").update(dbPatch).eq("id", courseUuid));
  },

  async publishCourse(demoCourseId: string): Promise<Result> {
    return db.updateCourse(demoCourseId, { published: true });
  },

  // ---------- Paths ----------
  async insertPath(input: {
    dbId: string;
    orgId: string;
    workspaceId?: string;
    name: string;
    audience: string;
    required: boolean;
    certificateOnComplete: boolean;
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const orgUuid = toUuid(orgIdToUuid, input.orgId);
    const wsUuid = input.workspaceId ? toUuid(workspaceIdToUuid, input.workspaceId) : null;
    if (!orgUuid) return { ok: false, reason: "unknown org id" };
    return safe(() =>
      client.from("learning_paths").insert({
        id: input.dbId,
        org_id: orgUuid,
        workspace_id: wsUuid,
        name: input.name,
        summary: input.audience ? `For ${input.audience}` : "",
        audience: input.audience,
        cover_accent: "northstar",
        certificate_on_complete: input.certificateOnComplete,
        required: input.required,
        published: false,
        assigned_count: 0,
        completion_rate: 0,
        updated_at: new Date().toISOString(),
      })
    );
  },

  async updatePathStructure(_demoPathId: string, _nodes: unknown[], _edges: unknown[]): Promise<Result> {
    // Structure edits happen on the in-memory seed. When the drag-drop
    // editor lands, this is where we'd diff-apply nodes + edges to
    // path_nodes / path_edges.
    return memoryOnly();
  },

  // ---------- Smart groups ----------
  async insertSmartGroup(input: {
    dbId: string;
    orgId: string;
    workspaceId?: string;
    name: string;
    description: string;
    conditions: SmartGroupCondition[];
    memberCount: number;
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const orgUuid = toUuid(orgIdToUuid, input.orgId);
    const wsUuid = input.workspaceId ? toUuid(workspaceIdToUuid, input.workspaceId) : null;
    if (!orgUuid) return { ok: false, reason: "unknown org id" };
    return safe(() =>
      client.from("smart_groups").insert({
        id: input.dbId,
        org_id: orgUuid,
        workspace_id: wsUuid,
        name: input.name,
        description: input.description,
        conditions: input.conditions,
        member_count: input.memberCount,
      })
    );
  },

  // ---------- Assignments ----------
  async insertAssignment(input: {
    dbId: string;
    userId: string;
    courseId?: string;
    pathId?: string;
    method: string;
    source?: string;
    dueAt?: string;
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const userUuid = toUuid(userIdToUuid, input.userId);
    const courseUuid = input.courseId ? toUuid(courseIdToUuid, input.courseId) : null;
    const pathUuid = input.pathId ? toUuid(pathIdToUuid, input.pathId) : null;
    if (!userUuid) return { ok: false, reason: "unknown user id" };
    return safe(() =>
      client.from("assignments").insert({
        id: input.dbId,
        user_id: userUuid,
        course_id: courseUuid,
        path_id: pathUuid,
        method: input.method,
        source: input.source ?? null,
        status: "not_started",
        progress: 0,
        due_at: input.dueAt ?? null,
        assigned_at: new Date().toISOString(),
      })
    );
  },

  async markComplete(input: {
    userId: string;
    courseId: string;
    expiresAt?: string;
    score?: number;
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const userUuid = toUuid(userIdToUuid, input.userId);
    const courseUuid = toUuid(courseIdToUuid, input.courseId);
    if (!userUuid || !courseUuid) return { ok: false, reason: "unknown user/course id" };
    const now = new Date().toISOString();
    const { error } = await client
      .from("assignments")
      .update({
        status: "completed",
        progress: 1,
        completed_at: now,
        expires_at: input.expiresAt ?? null,
        score: input.score ?? null,
      })
      .eq("user_id", userUuid)
      .eq("course_id", courseUuid);
    if (error) return { ok: false, reason: error.message };
    return { ok: true };
  },

  async insertCertificate(input: {
    dbId: string;
    userId: string;
    courseId: string;
    credentialCode: string;
    expiresAt?: string;
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const userUuid = toUuid(userIdToUuid, input.userId);
    const courseUuid = toUuid(courseIdToUuid, input.courseId);
    if (!userUuid || !courseUuid) return { ok: false, reason: "unknown user/course id" };
    return safe(() =>
      client.from("certificates").insert({
        id: input.dbId,
        user_id: userUuid,
        course_id: courseUuid,
        credential_code: input.credentialCode,
        pdf_template: "default",
        status: "active",
        issued_at: new Date().toISOString(),
        expires_at: input.expiresAt ?? null,
      })
    );
  },

  // ---------- Surveys ----------
  async recordSurveyAssignments(input: {
    userId: string;
    surveyId: string;
    triggeredCourseIds: string[];
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const userUuid = toUuid(userIdToUuid, input.userId);
    if (!userUuid) return { ok: false, reason: "unknown user id" };
    if (input.triggeredCourseIds.length === 0) return { ok: true };
    const rows = input.triggeredCourseIds
      .map((cid) => ({ id: crypto.randomUUID(), courseUuid: toUuid(courseIdToUuid, cid), cid }))
      .filter((r) => !!r.courseUuid)
      .map((r) => ({
        id: r.id,
        user_id: userUuid,
        course_id: r.courseUuid,
        method: "survey",
        source: `Survey: ${surveyIdToUuid[input.surveyId] ? input.surveyId : "custom"}`,
        status: "not_started",
        progress: 0,
        assigned_at: new Date().toISOString(),
      }));
    if (rows.length === 0) return { ok: true };
    return safe(() => client.from("assignments").insert(rows));
  },

  // ---------- AI ----------
  async insertAiSuggestion(input: {
    dbId: string;
    orgId: string;
    workspaceId: string;
    courseId: string;
    userId: string;
    reason: string;
    confidence: number;
    evidence: string[];
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const orgUuid = toUuid(orgIdToUuid, input.orgId);
    const wsUuid = toUuid(workspaceIdToUuid, input.workspaceId);
    const courseUuid = toUuid(courseIdToUuid, input.courseId);
    const userUuid = toUuid(userIdToUuid, input.userId);
    if (!orgUuid || !wsUuid || !courseUuid || !userUuid) {
      return { ok: false, reason: "unknown id in ai suggestion" };
    }
    return safe(() =>
      client.from("ai_suggestions").insert({
        id: input.dbId,
        org_id: orgUuid,
        workspace_id: wsUuid,
        course_id: courseUuid,
        user_id: userUuid,
        reason: input.reason,
        confidence: input.confidence,
        evidence: input.evidence,
        status: "pending",
      })
    );
  },

  async updateAiSuggestionStatus(
    demoSuggestionId: string,
    status: "approved" | "rejected"
  ): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    // Demo-created suggestions use fresh uuids; seeded ones too.
    return safe(() =>
      client.from("ai_suggestions").update({ status }).eq("id", demoSuggestionId)
    );
  },

  // ---------- Audit ----------
  async appendAudit(input: {
    orgId?: string;
    workspaceId?: string;
    actorId?: string;
    action: string;
    target?: string;
    meta?: Record<string, unknown>;
  }): Promise<Result> {
    const client = supabase();
    if (!client) return memoryOnly();
    const orgUuid = input.orgId ? toUuid(orgIdToUuid, input.orgId) : null;
    const wsUuid = input.workspaceId ? toUuid(workspaceIdToUuid, input.workspaceId) : null;
    const actorUuid = input.actorId ? toUuid(userIdToUuid, input.actorId) : null;
    return safe(() =>
      client.from("audit_log").insert({
        org_id: orgUuid,
        workspace_id: wsUuid,
        actor_id: actorUuid,
        action: input.action,
        target: input.target ?? null,
        meta: input.meta ?? null,
      })
    );
  },
} as const;

/**
 * Email adapter. Wires to Resend when RESEND_API_KEY is set; otherwise
 * acts as a demo no-op.
 */
export const mailer = {
  async sendEmail(args: {
    to: string;
    subject: string;
    body: string;
    template?: string;
    variables?: Record<string, string>;
  }) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.log("[mailer:demo]", args.to, args.subject);
      return { ok: true as const, delivered: false };
    }
    try {
      // Optional dependency. Installed only when outbound email is wired up.
      // `webpackIgnore` prevents bundler errors when the package isn't present.
      const resendModule: { Resend: new (key: string) => { emails: { send: (x: unknown) => Promise<unknown> } } } =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (new Function("m", "return import(m)"))("resend") as any;
      const client = new resendModule.Resend(apiKey);
      await client.emails.send({
        from: process.env.MAIL_FROM ?? "Northstar LXP <no-reply@northstar.app>",
        to: args.to,
        subject: args.subject,
        html: args.body,
      });
      return { ok: true as const, delivered: true };
    } catch (err) {
      console.error("[mailer:error]", err);
      return { ok: false as const, error: String(err) };
    }
  },
} as const;

export { supabaseEnabled };
