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
      return "/manager";
    default:
      return "/learner";
  }
}

export const AUTH_COOKIE = COOKIE;
export const IMPERSONATION_COOKIE = IMPERSONATE_COOKIE;
export const allUsers = users;
