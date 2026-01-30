import { CONFIG } from "./config.js";

export function getSupabase() {
  if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
    throw new Error(
      "SUPABASE_URL/SUPABASE_ANON_KEY não configurados. Crie /admin/env.local.js (baseado no env.example.js) ou configure as variáveis no Netlify."
    );
  }
  return window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
}
