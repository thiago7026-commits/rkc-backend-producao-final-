// Supabase client initialization for static sites.
// Configure SUPABASE_URL and SUPABASE_ANON_KEY on Netlify and expose them
// via a small env script (ex: /env.js) that sets window.__ENV__ or window.ENV.
// Example env.js:
// window.__ENV__ = { SUPABASE_URL: "https://xyz.supabase.co", SUPABASE_ANON_KEY: "public-anon-key" };

const env = window.__ENV__ || window.ENV || {};

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  console.warn("[supabaseClient] Missing SUPABASE_URL or SUPABASE_ANON_KEY.");
}

export const supabase = window.supabase.createClient(
  env.SUPABASE_URL || "",
  env.SUPABASE_ANON_KEY || ""
);
