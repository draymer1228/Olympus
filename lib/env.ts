// Public settings. Both values are safe to ship to the browser: the
// publishable key only allows what the database's row-level security allows.
// Secret keys never belong in this file or in any NEXT_PUBLIC_ variable.

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isConfigured = Boolean(supabaseUrl && supabasePublishableKey);

// "production", "preview" or "development" on Vercel; "local" on a laptop.
export const environmentName = process.env.VERCEL_ENV ?? "local";

// The household's time zone, used when a time is written out on the server.
export const HOUSEHOLD_TIME_ZONE = "America/Boise";
