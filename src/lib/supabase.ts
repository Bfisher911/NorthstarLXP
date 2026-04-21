import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client. Uses the service_role key so mutations and
 * reads from server components / server actions bypass RLS. Never import
 * this module from client components — it's gated by env and will refuse
 * to initialize if the service key is missing.
 */

let _client: SupabaseClient | null = null;

export function supabaseEnabled(): boolean {
  if (process.env.USE_SUPABASE !== "true") return false;
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return false;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
  return true;
}

export function supabase(): SupabaseClient | null {
  if (!supabaseEnabled()) return null;
  if (_client) return _client;
  _client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
  return _client;
}
