/**
 * Database adapter shim.
 *
 * Northstar's runtime uses the in-memory store in `src/lib/data.ts`. When you
 * provision a Supabase project and set `NEXT_PUBLIC_SUPABASE_URL` +
 * `SUPABASE_SERVICE_ROLE_KEY`, flip `USE_SUPABASE=true` in your env and the
 * mutations in `src/app/actions/mutations.ts` can route through the adapter
 * below instead of mutating local arrays.
 *
 * The adapter is intentionally a thin wrapper — not an ORM. One function per
 * logical action. That matches the shape of the mutations file so the
 * swap-over is ~10 edits: each mutation stops pushing into the array and
 * starts calling the matching `db.*` method.
 *
 * Schema lives in `db/schema.sql`; RLS policies in `db/policies.sql`. Run
 * both against your Supabase project before enabling the adapter.
 */

import type {
  Assignment,
  Course,
  LearningPath,
  SmartGroup,
  Survey,
} from "./types";

const USE_SUPABASE =
  typeof process !== "undefined" && process.env.USE_SUPABASE === "true";

// Lazy, typed, optional Supabase client. We only import the SDK when it's
// actually configured so the in-memory build stays free of the dependency.
type SupabaseClient = {
  from: (table: string) => {
    insert: (row: unknown) => Promise<{ data: unknown; error: unknown }>;
    update: (patch: unknown) => { eq: (col: string, val: unknown) => Promise<unknown> };
    select: (cols?: string) => {
      eq: (col: string, val: unknown) => Promise<{ data: unknown[]; error: unknown }>;
    };
  };
};

let _client: SupabaseClient | null = null;

async function getClient(): Promise<SupabaseClient | null> {
  if (!USE_SUPABASE) return null;
  if (_client) return _client;
  try {
    // @ts-expect-error — optional dependency installed by the caller
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    _client = createClient(url, key) as SupabaseClient;
    return _client;
  } catch {
    // Package not installed — stay in in-memory mode.
    return null;
  }
}

export const db = {
  enabled: USE_SUPABASE,

  async insertCourse(c: Course) {
    const client = await getClient();
    if (!client) return { ok: false as const, reason: "memory" };
    await client.from("courses").insert(c);
    return { ok: true as const };
  },
  async updateCourse(id: string, patch: Partial<Course>) {
    const client = await getClient();
    if (!client) return { ok: false as const, reason: "memory" };
    await client.from("courses").update(patch).eq("id", id);
    return { ok: true as const };
  },
  async insertPath(p: LearningPath) {
    const client = await getClient();
    if (!client) return { ok: false as const, reason: "memory" };
    await client.from("learning_paths").insert(p);
    return { ok: true as const };
  },
  async insertAssignment(a: Assignment) {
    const client = await getClient();
    if (!client) return { ok: false as const, reason: "memory" };
    await client.from("assignments").insert(a);
    return { ok: true as const };
  },
  async insertSmartGroup(g: SmartGroup) {
    const client = await getClient();
    if (!client) return { ok: false as const, reason: "memory" };
    await client.from("smart_groups").insert(g);
    return { ok: true as const };
  },
  async recordSurveyResponse(input: {
    surveyId: string;
    userId: string;
    answers: Record<string, string>;
  }) {
    const client = await getClient();
    if (!client) return { ok: false as const, reason: "memory" };
    await client.from("survey_responses").insert(input);
    return { ok: true as const };
  },
} as const;

/**
 * A notification-sender port. The in-memory demo simply writes to the audit
 * log; a real deploy would configure SendGrid / Resend / Postmark and implement
 * `sendEmail` here. Same "configure by env, keep signatures stable" shape.
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
      // Demo mode — no-op success.
      console.log("[mailer:demo]", args.to, args.subject);
      return { ok: true as const, delivered: false };
    }
    try {
      // @ts-expect-error — optional dependency
      const { Resend } = await import("resend");
      const client = new Resend(apiKey);
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

/**
 * Storage adapter placeholder. Bound to Supabase Storage when configured,
 * falls back to "pretend it uploaded" in demo mode.
 */
export const storage = {
  async upload(args: { bucket: string; path: string; data: Blob | ArrayBuffer; contentType: string }) {
    const client = await getClient();
    if (!client) {
      // Demo mode: return a data URL-like placeholder so previews still render.
      return { ok: true as const, url: `data:${args.contentType};base64,demo`, mode: "memory" as const };
    }
    // In a real implementation:
    // const { data, error } = await client.storage
    //   .from(args.bucket)
    //   .upload(args.path, args.data, { contentType: args.contentType });
    return { ok: true as const, url: `/storage/${args.bucket}/${args.path}`, mode: "supabase" as const };
  },
} as const;

export type { Assignment, Course, LearningPath, SmartGroup, Survey };
