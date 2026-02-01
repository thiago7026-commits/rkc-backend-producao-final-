// Supabase client initialization for static HTML sites using ESM CDN.
// Expect SUPABASE_URL and SUPABASE_ANON_KEY to be defined on window.
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const { SUPABASE_URL, SUPABASE_ANON_KEY } = window;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("[supabaseClient] Missing SUPABASE_URL or SUPABASE_ANON_KEY on window.");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON_KEY || "");
