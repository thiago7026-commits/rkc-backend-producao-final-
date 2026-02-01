import { supabase } from "/js/supabaseClient.js";

export async function requireAdmin() {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("[admin-guard] Session error:", sessionError);
  }

  if (!session) {
    window.location.href = "/admin/admin-login.html";
    return;
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("roles(name)")
    .eq("user_id", session.user.id);

  if (error) {
    console.error("[admin-guard] Role check error:", error);
  }

  const roles = Array.isArray(data) ? data : data ? [data] : [];
  const isAdmin = roles.some((row) => row?.roles?.name === "admin");

  if (!isAdmin) {
    await supabase.auth.signOut();
    window.location.href = "/";
  }
}
