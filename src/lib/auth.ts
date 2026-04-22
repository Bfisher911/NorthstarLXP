import { cookies } from "next/headers";
import { getUserById, personas, users } from "./data";
import type { Role, UserRecord } from "./types";
import { supabaseServer } from "./supabase-server";
import { supabaseEnabled } from "./supabase";

/**
 * Unified session resolver. Supabase Auth is the first-class path; a cookie
 * carrying a persona ID is kept as a demo / dev fallback and is the only
 * session mechanism when Supabase isn't configured.
 *
 * Resolution order:
 *   1. If Supabase is enabled AND a valid Supabase session exists, look up
 *      the linked public.users row via users.auth_id.
 *   2. Otherwise fall back to the demo `northstar_uid` cookie (dev / preview
 *      environments).
 *
 * This lets us keep the persona picker usable for product reviews while
 * prod traffic goes through real auth.
 */

const COOKIE = "northstar_uid";
const IMPERSONATE_COOKIE = "northstar_imp";

export type Session = {
  user: UserRecord;
  impersonating?: { originalUserId: string };
};

export async function getSession(): Promise<Session | null> {
  // Supabase Auth — preferred path.
  if (supabaseEnabled()) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { data } = await supabase.auth.getUser();
      const authUser = data?.user;
      if (authUser) {
        // Resolve the linked public.users record via auth_id or email.
        const { data: linkedRow } = await supabase
          .from("users")
          .select("id, email")
          .eq("auth_id", authUser.id)
          .maybeSingle();
        let publicId: string | null = (linkedRow as { id?: string } | null)?.id ?? null;
        if (!publicId && authUser.email) {
          // Fall back to the in-memory user lookup by email so the UI keeps
          // working even if the adapter-side id hasn't been backfilled.
          const byEmail = users.find(
            (u) => u.email.toLowerCase() === authUser.email!.toLowerCase()
          );
          if (byEmail) publicId = byEmail.id;
        }
        if (publicId) {
          const user = getUserById(publicId);
          if (user) {
            const store = await cookies();
            const impUid = store.get(IMPERSONATE_COOKIE)?.value;
            if (impUid && impUid !== publicId) {
              return { user, impersonating: { originalUserId: impUid } };
            }
            return { user };
          }
        }
      }
    }
  }

  // Demo cookie fallback. Useful in dev + when Supabase isn't configured.
  const store = await cookies();
  const uid = store.get(COOKIE)?.value;
  if (!uid) return null;
  const user = getUserById(uid);
  if (!user) return null;
  const impUid = store.get(IMPERSONATE_COOKIE)?.value;
  if (impUid && impUid !== uid) {
    return { user, impersonating: { originalUserId: impUid } };
  }
  return { user };
}

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) throw new Error("Not authenticated");
  return s;
}

export function highestRole(user: UserRecord): Role {
  const priority: Role[] = [
    "super_admin",
    "org_admin",
    "workspace_admin",
    "workspace_author",
    "workspace_viewer",
    "manager",
    "learner",
  ];
  for (const r of priority) {
    if (user.roles.some((ur) => ur.role === r)) return r;
  }
  return "learner";
}

export function defaultHome(user: UserRecord): string {
  const persona = personas.find((p) => p.userId === user.id);
  if (persona) return persona.homePath;
  const top = highestRole(user);
  switch (top) {
    case "super_admin":
      return "/admin";
    case "org_admin":
      return "/org/meridian";
    case "workspace_admin":
    case "workspace_author":
    case "workspace_viewer":
      return "/org/meridian/w/ehs";
    case "manager":
      return "/learner";
    default:
      return "/learner";
  }
}

export const AUTH_COOKIE = COOKIE;
export const IMPERSONATION_COOKIE = IMPERSONATE_COOKIE;
export const allUsers = users;

/**
 * True if `user` has *any* elevated role (admin/manager/viewer/author) within
 * the given org. Used by org and workspace layouts to keep learners out of
 * admin surfaces.
 */
export function canAccessOrg(user: UserRecord, orgId: string): boolean {
  if (user.roles.some((r) => r.role === "super_admin")) return true;
  if (user.orgId !== orgId) return false;
  return user.roles.some((r) =>
    [
      "org_admin",
      "workspace_admin",
      "workspace_author",
      "workspace_viewer",
      "manager",
    ].includes(r.role)
  );
}

export function canAccessWorkspace(user: UserRecord, orgId: string, workspaceId: string): boolean {
  if (user.roles.some((r) => r.role === "super_admin")) return true;
  if (user.orgId !== orgId) return false;
  // Org admins see every workspace in their org.
  if (user.roles.some((r) => r.role === "org_admin")) return true;
  // Managers can see workspace dashboards read-only (they have org scope).
  if (user.roles.some((r) => r.role === "manager")) return true;
  // Workspace-scoped roles are permitted only for their own workspace.
  return user.roles.some(
    (r) =>
      ["workspace_admin", "workspace_author", "workspace_viewer"].includes(r.role) &&
      (!r.workspaceId || r.workspaceId === workspaceId)
  );
}

export function canManageAsManager(user: UserRecord): boolean {
  return (
    user.roles.some((r) => r.role === "manager") ||
    user.roles.some((r) => r.role === "super_admin") ||
    user.roles.some((r) => r.role === "org_admin")
  );
}
