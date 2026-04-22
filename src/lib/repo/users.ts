import { cache } from "react";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseEnabled } from "@/lib/supabase";
import {
  users as seededUsers,
  getUserById as memGetUserById,
} from "@/lib/data";
import type { UserRecord } from "@/lib/types";

/**
 * Users repo. Hydrates the shape the UI expects — `roles` array + embedded
 * employee profile — from the normalized Postgres tables when Supabase is
 * on. Falls back to the in-memory seed otherwise.
 */

function mapUser(row: Record<string, unknown>): UserRecord {
  // Merge seed data when available so the UI gets a stable shape (including
  // direct-reports lists which aren't yet derived from HR feed tables).
  const email = String(row.email);
  const seeded = seededUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return {
    id: String(row.id),
    orgId: (row.org_id as string) ?? "",
    name: String(row.name),
    email,
    avatarSeed: (row.avatar_seed as string) ?? email,
    managerId: (row.manager_id as string) ?? seeded?.managerId,
    directReports: seeded?.directReports,
    employee: seeded?.employee,
    roles: seeded?.roles ?? [{ role: "learner", scope: "organization" }],
  };
}

export const getUserById = cache(async (id: string): Promise<UserRecord | null> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!error && data) return mapUser(data as Record<string, unknown>);
    }
  }
  return memGetUserById(id) ?? null;
});

export const getUserByAuthId = cache(async (authId: string): Promise<UserRecord | null> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authId)
        .maybeSingle();
      if (!error && data) return mapUser(data as Record<string, unknown>);
    }
  }
  return null;
});

export const getUsersForOrg = cache(async (orgId: string): Promise<UserRecord[]> => {
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("org_id", orgId)
        .order("name");
      if (!error && data) return (data as Record<string, unknown>[]).map(mapUser);
    }
  }
  return seededUsers.filter((u) => u.orgId === orgId);
});
