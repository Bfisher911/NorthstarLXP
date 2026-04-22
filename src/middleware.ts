import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

/**
 * Middleware runs on every authenticated request to keep the Supabase
 * session cookie fresh. If the service isn't configured we pass through.
 *
 * This is the canonical Next 15 pattern from @supabase/ssr docs: build a
 * response, hand its cookie store to the server client, let it rotate
 * tokens, return the (possibly updated) response.
 */
export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const enabled = process.env.USE_SUPABASE === "true" && !!url && !!anon;
  if (!enabled) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url!, anon!, {
    cookies: {
      getAll() {
        return request.cookies.getAll().map((c) => ({ name: c.name, value: c.value }));
      },
      setAll(list: Array<{ name: string; value: string; options?: CookieOptions }>) {
        for (const { name, value, options } of list) {
          request.cookies.set({ name, value, ...(options ?? {}) });
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) {
          response.cookies.set({ name, value, ...(options ?? {}) });
        }
      },
    },
  });
  // Touches auth → triggers token refresh when near expiry.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Skip static and internal Next paths.
    "/((?!_next/static|_next/image|favicon|icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
