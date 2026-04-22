import { cache } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseEnabled } from "@/lib/supabase";
import {
  organizations as seededOrgs,
  getOrgById as memGetOrgById,
  getOrgBySlug as memGetOrgBySlug,
} from "@/lib/data";
import type { Organization } from "@/lib/types";

/**
 * Organizations repo. Every read is async — Supabase when configured,
 * seeded in-memory data otherwise. Wrapped in React's `cache()` so a
 * single request de-duplicates multiple calls.
 */

function mapOrg(row: Record<string, unknown>): Organization {
  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    plan: (row.plan as Organization["plan"]) ?? "starter",
    industry: (row.industry as string) ?? "",
    logoInitials: (row.logo_initials as string) ?? "",
    accent: (row.accent as string) ?? "sky",
    seats: Number(row.seats ?? 0),
    activeLearners: Number(row.seats ?? 0),
    storageGb: Number(row.storage_gb ?? 0),
    storageQuotaGb: Number(row.storage_quota_gb ?? 100),
    complianceHealth: Number(row.compliance_health ?? 0),
    createdAt: String(row.created_at ?? ""),
    headquarters: (row.headquarters as string) ?? "",
    primaryDomain: (row.primary_domain as string) ?? "",
    flags: (row.flags as Organization["flags"]) ?? [],
  };
}

export const getOrgBySlug = cache(async (slug: string): Promise<Organization | null> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (!error && data) return mapOrg(data as Record<string, unknown>);
    }
  }
  return memGetOrgBySlug(slug) ?? null;
});

export const getOrgById = cache(async (id: string): Promise<Organization | null> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return mapOrg(data as Record<string, unknown>);
    }
  }
  return memGetOrgById(id) ?? null;
});

export const listOrgs = cache(async (): Promise<Organization[]> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("organizations")
        .select("*")
        .order("name");
      if (!error && data) return (data as Record<string, unknown>[]).map(mapOrg);
    }
  }
  return seededOrgs;
});
