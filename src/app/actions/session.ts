"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, IMPERSONATION_COOKIE, defaultHome } from "@/lib/auth";
import { getUserById, users as seededUsers } from "@/lib/data";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseEnabled } from "@/lib/supabase";

function devPersonasEnabled(): boolean {
  // Allow persona-based sign-in in dev, or when Supabase isn't configured.
  if (!supabaseEnabled()) return true;
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ALLOW_DEMO_PERSONAS === "true";
}

/**
 * Dev / demo sign-in by persona id. No password; gated to non-prod or
 * opted-in environments. In production, Supabase Auth is the path.
 */
export async function signInAs(formData: FormData) {
  if (!devPersonasEnabled()) {
    throw new Error("Persona sign-in is disabled in production");
  }
  const userId = String(formData.get("userId") ?? "");
  const user = getUserById(userId);
  if (!user) throw new Error("User not found");
  const store = await cookies();
  store.set(AUTH_COOKIE, userId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });
  store.delete(IMPERSONATION_COOKIE);
  redirect(defaultHome(user));
}

/**
 * Password-based sign-in via Supabase Auth. On success Supabase sets its
 * own session cookies (via the SSR client); we also resolve the linked
 * public.users row so we can redirect to the right home surface.
 */
export async function signInWithPassword(
  formData: FormData
): Promise<{ ok: false; error: string } | void> {
  const supabase = await supabaseServer();
  if (!supabase) return { ok: false, error: "Auth not configured on this server." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Email and password are required." };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    return { ok: false, error: error?.message ?? "Invalid email or password." };
  }

  // Resolve the linked public.users row for redirect targeting. Uses an
  // email lookup because the adapter readers aren't Supabase-backed yet
  // (Phase 1 continuation); falls back to seed data.
  const seeded = seededUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
  redirect(seeded ? defaultHome(seeded) : "/learner");
}

/**
 * Magic-link sign-in. Supabase emails a one-time link; clicking it routes
 * through `/auth/callback`.
 */
export async function signInWithMagicLink(
  formData: FormData
): Promise<{ ok: boolean; error?: string; sent?: boolean }> {
  const supabase = await supabaseServer();
  if (!supabase) return { ok: false, error: "Auth not configured on this server." };
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { ok: false, error: "Enter your work email." };

  const hdrs = await headers();
  const origin =
    hdrs.get("origin") ??
    hdrs.get("x-forwarded-host")?.replace(/^/, "https://") ??
    "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, sent: true };
}

/** Create a new learner account with email + password. */
export async function signUpWithPassword(
  formData: FormData
): Promise<{ ok: false; error: string } | void> {
  const supabase = await supabaseServer();
  if (!supabase) return { ok: false, error: "Auth not configured on this server." };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Email and password are required." };
  if (password.length < 8) return { ok: false, error: "Use at least 8 characters." };

  const hdrs = await headers();
  const origin = hdrs.get("origin") ?? "http://localhost:3000";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { ok: false, error: error.message };
  redirect(`/sign-in?message=${encodeURIComponent("Check your email to confirm your account.")}`);
}

export async function signOut() {
  const store = await cookies();
  const supabase = await supabaseServer();
  if (supabase) {
    await supabase.auth.signOut();
  }
  store.delete(AUTH_COOKIE);
  store.delete(IMPERSONATION_COOKIE);
  redirect("/sign-in");
}

export async function startImpersonation(formData: FormData) {
  const targetUserId = String(formData.get("targetUserId") ?? "");
  const store = await cookies();
  const actor = store.get(AUTH_COOKIE)?.value;
  if (!actor) throw new Error("Not signed in");
  store.set(IMPERSONATION_COOKIE, actor, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
  store.set(AUTH_COOKIE, targetUserId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
  });
  const target = getUserById(targetUserId);
  redirect(target ? defaultHome(target) : "/");
}

export async function stopImpersonation() {
  const store = await cookies();
  const original = store.get(IMPERSONATION_COOKIE)?.value;
  if (original) {
    store.set(AUTH_COOKIE, original, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });
    store.delete(IMPERSONATION_COOKIE);
  }
  const user = original ? getUserById(original) : undefined;
  redirect(user ? defaultHome(user) : "/");
}
