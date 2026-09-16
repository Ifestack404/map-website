import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null | undefined;

function readPublicConfig(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

/**
 * Browser-safe Supabase client (anon key only).
 * Returns null when the project is not configured so the UI can show a calm empty/error state.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (client !== undefined) return client;

  const config = readPublicConfig();
  if (!config) {
    client = null;
    return client;
  }

  client = createClient(config.url, config.anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

export function isSupabaseConfigured(): boolean {
  return readPublicConfig() !== null;
}
