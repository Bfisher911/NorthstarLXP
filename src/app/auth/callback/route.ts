import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

/**
 * Auth callback invoked after email magic-link / OAuth redirects. Exchanges
 * the returned `code` for a session, sets the session cookies, then sends
 * the user to their home surface. Defaults to /learner if we can't resolve
 * a specific home — safe because learner is the least-privileged surface.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/learner";

  if (code) {
    const supabase = await supabaseServer();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return NextResponse.redirect(
          new URL(`/sign-in?error=${encodeURIComponent(error.message)}`, url.origin)
        );
      }
    }
  }
  return NextResponse.redirect(new URL(next, url.origin));
}
