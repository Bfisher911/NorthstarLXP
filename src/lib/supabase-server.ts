import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createPlainClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnabled } from "./supabase";

/**
 * Cookie-aware Supabase client used from Server Components, Route Handlers,
 * and Server Actions. Reads the current user's session out of the request
 * cookies so RLS policies can see `auth.uid()`.
 *
 * Safe to call from anywhere on the server; `cookies()` is awaited before
 * constructing the client per Next 15's async cookies API.
 */
export async function supabaseServer(): Promise<SupabaseClient | null> {
  if (!supabaseEnabled()) return null;
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll().map((c) => ({ name: c.name, value: c.value }));
        },
        setAll(list: Array<{ name: string; value: string; options?: CookieOptions }>) {
          try {
            for (const { name, value, options } of list) {
              store.set(name, value, options);
            }
          } catch {
            // Server Components can't write cookies — handled in middleware instead.
          }
        },
      },
    }
  );
}

/**
 * Service-role client for privileged server-side operations that must
 * bypass RLS (seeding, migrations, admin provisioning, audit writes from
 * webhooks). Never import this from anything that runs on the client.
 */
export function supabaseAdmin(): SupabaseClient | null {
  if (!supabaseEnabled()) return null;
  return createPlainClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
