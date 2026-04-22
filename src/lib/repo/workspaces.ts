import { cache } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseEnabled } from "@/lib/supabase";
import {
  workspaces as seededWorkspaces,
  getWorkspacesForOrg as memWorkspacesForOrg,
  getWorkspaceBySlug as memWorkspaceBySlug,
  getWorkspaceById as memWorkspaceById,
} from "@/lib/data";
import type { Workspace } from "@/lib/types";

function mapWorkspace(row: Record<string, unknown>): Workspace {
  return {
    id: String(row.id),
    orgId: String(row.org_id),
    slug: String(row.slug),
    name: String(row.name),
    department: (row.department as string) ?? "",
    description: (row.description as string) ?? "",
    emoji: (row.emoji as string) ?? "🗂️",
    accent: (row.accent as string) ?? "sky",
    // course/path counts + compliance health aren't stored on the row yet.
    // Until the reporting pipeline lands we fall back to sane defaults;
    // the seed copy gets richer numbers for the demo.
    courseCount: 0,
    pathCount: 0,
    activeAssignments: 0,
    complianceHealth: 0,
    lead: (row.lead_user_id as string) ?? "",
  };
}

/**
 * Return the workspaces for an org, hydrating counts / compliance health
 * from the in-memory seed when a matching workspace exists there (since
 * the current schema doesn't store rollups yet). When the seed has no
 * match, we use the defaults from `mapWorkspace`.
 */
export const getWorkspacesForOrg = cache(async (orgId: string): Promise<Workspace[]> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("org_id", orgId)
        .order("name");
      if (!error && data) {
        return (data as Record<string, unknown>[]).map((row) => {
          const base = mapWorkspace(row);
          const seeded = seededWorkspaces.find((w) => w.slug === base.slug);
          return seeded ? { ...base, ...pick(seeded, ["courseCount", "pathCount", "activeAssignments", "complianceHealth"]) } : base;
        });
      }
    }
  }
  return memWorkspacesForOrg(orgId);
});

export const getWorkspaceBySlug = cache(
  async (orgId: string, slug: string): Promise<Workspace | null> => {
    if (supabaseEnabled()) {
      const supabase = await supabaseServer();
      if (supabase) {
        const { data, error } = await supabase
          .from("workspaces")
          .select("*")
          .eq("org_id", orgId)
          .eq("slug", slug)
          .maybeSingle();
        if (!error && data) {
          const base = mapWorkspace(data as Record<string, unknown>);
          const seeded = seededWorkspaces.find((w) => w.slug === slug);
          return seeded ? { ...base, ...pick(seeded, ["courseCount", "pathCount", "activeAssignments", "complianceHealth"]) } : base;
        }
      }
    }
    return memWorkspaceBySlug(orgId, slug) ?? null;
  }
);

export const getWorkspaceById = cache(async (id: string): Promise<Workspace | null> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) {
        const base = mapWorkspace(data as Record<string, unknown>);
        const seeded = seededWorkspaces.find((w) => w.slug === base.slug);
        return seeded ? { ...base, ...pick(seeded, ["courseCount", "pathCount", "activeAssignments", "complianceHealth"]) } : base;
      }
    }
  }
  return memWorkspaceById(id) ?? null;
});

function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const out = {} as Pick<T, K>;
  for (const k of keys) out[k] = obj[k];
  return out;
}
