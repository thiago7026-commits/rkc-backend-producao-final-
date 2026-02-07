(() => {
  const getEnvValue = (key) => {
    if (window.ENV && window.ENV[key]) return window.ENV[key];
    if (window.__ENV__ && window.__ENV__[key]) return window.__ENV__[key];
    return "";
  };

  let client;
  window.getSupabaseClient = () => {
    if (client) return client;
    if (!window.supabase) {
      throw new Error("Biblioteca Supabase não carregada.");
    }
    const supabaseUrl = getEnvValue("SUPABASE_URL");
    const supabaseAnonKey = getEnvValue("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "SUPABASE_URL/SUPABASE_ANON_KEY não configurados. Configure no Netlify ou em /admin/env.local.js."
      );
    }
    client = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    return client;
  };
})();
