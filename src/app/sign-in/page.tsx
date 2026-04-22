import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { NorthstarLogo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthForms } from "@/components/auth/auth-forms";
import { signInAs } from "@/app/actions/session";
import { personas } from "@/lib/data";
import { supabaseEnabled } from "@/lib/supabase";

const roleAccent: Record<string, string> = {
  super_admin: "from-violet-500/20 to-fuchsia-500/10 border-violet-400/40",
  org_admin: "from-sky-500/20 to-emerald-500/10 border-sky-400/40",
  workspace_admin: "from-emerald-500/20 to-cyan-500/10 border-emerald-400/40",
  manager: "from-amber-500/20 to-orange-500/10 border-amber-400/40",
  learner: "from-northstar-500/20 to-indigo-500/10 border-northstar-400/40",
};

const roleLabel: Record<string, string> = {
  super_admin: "Platform Super Admin",
  org_admin: "Organization Admin",
  workspace_admin: "Workspace Admin",
  manager: "People Manager",
  learner: "Learner",
};

function personaPickerEnabled(): boolean {
  if (!supabaseEnabled()) return true;
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.ALLOW_DEMO_PERSONAS === "true";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ message?: string; error?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const message = params.message;
  const error = params.error;
  const showPersonas = personaPickerEnabled();
  const authReady = supabaseEnabled();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div aria-hidden className="absolute inset-0 bg-aurora opacity-80" />
      <div aria-hidden className="absolute inset-0 bg-star-field opacity-60" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/">
          <NorthstarLogo />
        </Link>
        <Link href="/">
          <Button variant="ghost" size="sm">
            Back to home
          </Button>
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-16 pt-4">
        <div className="mx-auto max-w-2xl text-center">
          <Badge
            variant="outline"
            className="mb-3 border-northstar-400/40 bg-northstar-500/10 text-northstar-700 dark:text-northstar-200"
          >
            <Sparkles className="h-3 w-3" /> Welcome
          </Badge>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Sign in to Northstar LXP
          </h1>
          <p className="mt-2 text-muted-foreground">
            {authReady
              ? "Use your work email. Prefer not to remember a password? Try the magic-link tab."
              : "Configure Supabase Auth to enable password and magic-link sign-in. For now, use a demo persona below."}
          </p>
          {message && (
            <div className="mx-auto mt-4 max-w-sm rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-foreground">
              {message}
            </div>
          )}
          {error && (
            <div className="mx-auto mt-4 max-w-sm rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-foreground">
              {error}
            </div>
          )}
        </div>

        {authReady && (
          <div className="mx-auto mt-8 max-w-sm">
            <AuthForms />
          </div>
        )}

        {showPersonas && (
          <section className="mx-auto mt-14 max-w-4xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {authReady ? "Or jump in as a demo persona" : "Demo personas"}
              </div>
              {authReady && (
                <Badge variant="outline" className="text-[10px]">
                  Dev-only · hidden in production
                </Badge>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {personas.map((p) => (
                <form key={p.userId} action={signInAs}>
                  <input type="hidden" name="userId" value={p.userId} />
                  <button
                    type="submit"
                    className={`group relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br ${
                      roleAccent[p.role] ?? "from-muted to-muted/50 border-border"
                    } p-5 text-left transition hover:shadow-lg`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {roleLabel[p.role] ?? p.role}
                        </div>
                        <div className="mt-1 font-display text-lg font-semibold">{p.title}</div>
                        <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition group-hover:border-primary group-hover:text-primary">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="pointer-events-none absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-white/40 blur-2xl dark:bg-white/10" />
                  </button>
                </form>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
