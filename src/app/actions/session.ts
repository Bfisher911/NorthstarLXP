"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE, IMPERSONATION_COOKIE, defaultHome } from "@/lib/auth";
import { getUserById } from "@/lib/data";

export async function signInAs(formData: FormData) {
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

export async function signOut() {
  const store = await cookies();
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
