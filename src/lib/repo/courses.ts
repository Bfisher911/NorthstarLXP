import { cache } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseEnabled } from "@/lib/supabase";
import {
  courses as seededCourses,
  getCourseById as memGetCourseById,
  getCoursesForOrg as memCoursesForOrg,
  getCoursesForWorkspace as memCoursesForWorkspace,
} from "@/lib/data";
import type { Course } from "@/lib/types";

/**
 * Courses repo. The Postgres row only holds top-level metadata — modules,
 * learning objectives, and references continue to live in the in-memory
 * seed until the module-tree writer ships (Phase 2). For any DB-backed
 * row we merge those rich fields from the seed when a matching slug-ish
 * course exists.
 */

function mapCourse(row: Record<string, unknown>): Course {
  const id = String(row.id);
  const seeded = seededCourses.find(
    (c) => c.id === id || c.title.toLowerCase() === String(row.title).toLowerCase()
  );
  return {
    id,
    orgId: String(row.org_id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    summary: (row.summary as string) ?? "",
    description: (row.description as string) ?? "",
    type: (row.type as Course["type"]) ?? "authored",
    category: (row.category as string) ?? "",
    tags: (row.tags as string[]) ?? [],
    durationMinutes: Number(row.duration_minutes ?? 0),
    thumbnailColor:
      (row.thumbnail_color as string) ??
      seeded?.thumbnailColor ??
      "from-northstar-500/90 to-indigo-600/90",
    thumbnailEmoji: (row.thumbnail_emoji as string) ?? seeded?.thumbnailEmoji ?? "✨",
    required: !!row.required,
    renewalMonths: (row.renewal_months as number) ?? seeded?.renewalMonths,
    certificateEnabled: !!row.certificate_enabled,
    aiContext: (row.ai_context as string) ?? seeded?.aiContext,
    regulatoryRefs: (row.regulatory_refs as string[]) ?? seeded?.regulatoryRefs,
    authors: seeded?.authors ?? [],
    published: !!row.published,
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    learningObjectives: seeded?.learningObjectives,
    overview: seeded?.overview,
    references: seeded?.references,
    modules: seeded?.modules,
    scheduledSessions: seeded?.scheduledSessions,
    policyFile: seeded?.policyFile,
    shareToOrg: !!row.share_to_org,
    retakePolicy: seeded?.retakePolicy,
    retakeWindowDays: seeded?.retakeWindowDays,
  };
}

export const getCourseById = cache(async (id: string): Promise<Course | null> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return mapCourse(data as Record<string, unknown>);
    }
  }
  return memGetCourseById(id) ?? null;
});

export const getCoursesForOrg = cache(async (orgId: string): Promise<Course[]> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("org_id", orgId)
        .order("title");
      if (!error && data) return (data as Record<string, unknown>[]).map(mapCourse);
    }
  }
  return memCoursesForOrg(orgId);
});

export const getCoursesForWorkspace = cache(async (workspaceId: string): Promise<Course[]> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("title");
      if (!error && data) return (data as Record<string, unknown>[]).map(mapCourse);
    }
  }
  return memCoursesForWorkspace(workspaceId);
});
