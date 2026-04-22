"use client";

import * as React from "react";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/actions/session";

type Mode = "password" | "magic" | "signup";

/**
 * Auth card — shown on /sign-in. Supports password login, passwordless
 * magic-link, and new-account sign-up. All three call Supabase Auth via
 * server actions and route through /auth/callback for email flows.
 */
export function AuthForms({ prefillEmail }: { prefillEmail?: string }) {
  const [mode, setMode] = React.useState<Mode>("password");
  const [email, setEmail] = React.useState(prefillEmail ?? "");
  const [password, setPassword] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [magicSent, setMagicSent] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const fd = new FormData();
    fd.set("email", email.trim());
    if (mode !== "magic") fd.set("password", password);
    startTransition(async () => {
      if (mode === "password") {
        const res = await signInWithPassword(fd);
        if (res && !res.ok) setErr(res.error);
      } else if (mode === "magic") {
        const res = await signInWithMagicLink(fd);
        if (res.ok) setMagicSent(true);
        else setErr(res.error ?? "Couldn't send link");
      } else {
        const res = await signUpWithPassword(fd);
        if (res && !res.ok) setErr(res.error);
      }
    });
  };

  return (
    <div className="mx-auto w-full max-w-sm rounded-2xl border bg-card p-6 shadow-lg">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {mode === "signup" ? "Create your account" : "Sign in"}
      </div>
      <h2 className="font-display text-xl font-semibold tracking-tight">
        {mode === "signup" ? "Join Northstar LXP" : "Welcome back"}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {mode === "magic"
          ? "We'll email you a one-time link — no password needed."
          : mode === "signup"
          ? "Use your work email. You'll be added to your organization automatically."
          : "Use your work email and password."}
      </p>

      <div className="mt-5 inline-flex w-full rounded-lg border p-0.5 text-xs">
        {([
          ["password", "Password"],
          ["magic", "Magic link"],
          ["signup", "Sign up"],
        ] as Array<[Mode, string]>).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setMagicSent(false);
            }}
            className={
              "flex-1 rounded-md px-2 py-1.5 font-medium transition " +
              (mode === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {magicSent ? (
        <div className="mt-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
          <div className="flex items-center gap-2 font-semibold">
            <Mail className="h-4 w-4 text-emerald-500" /> Link sent
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Check <strong className="text-foreground">{email}</strong>. Open the email on this
            device — the link will sign you in automatically.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMagicSent(false)}
            className="mt-2"
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-5 space-y-3">
          {err && (
            <div
              role="alert"
              className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs"
            >
              {err}
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@work.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>
          {mode !== "magic" && (
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                minLength={mode === "signup" ? 8 : undefined}
                placeholder={mode === "signup" ? "8+ characters" : ""}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
          <Button type="submit" disabled={pending} className="w-full" size="lg">
            {mode === "magic" ? (
              <>
                <Mail className="h-4 w-4" /> {pending ? "Sending…" : "Email me a link"}
              </>
            ) : mode === "signup" ? (
              <>
                {pending ? "Creating…" : "Create account"} <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <KeyRound className="h-4 w-4" /> {pending ? "Signing in…" : "Sign in"}
              </>
            )}
          </Button>
          {mode === "password" && (
            <p className="text-center text-[11px] text-muted-foreground">
              <span className="font-medium">Demo tip:</span> every seeded persona shares the
              password <Badge variant="outline" className="font-mono">northstar-demo</Badge>
            </p>
          )}
        </form>
      )}
    </div>
  );
}
