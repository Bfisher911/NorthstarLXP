import { cookies } from "next/headers";
import { getUserById, personas, users } from "./data";
import type { Role, UserRecord } from "./types";

/**
 * Demo auth layer. A signed-in user is identified by the `northstar_uid` cookie.
 * Replace with Supabase / NextAuth in production. All UI paths go through
 * `getSession()` so swapping the provider is a single-file change.
 */

const COOKIE = "northstar_uid";
const IMPERSONATE_COOKIE = "northstar_imp";

export type Session = {
  user: UserRecord;
  impersonating?: { originalUserId: string };
};

export async function getSession(): Promise<Session | null> {
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
