import { getSupabase } from "./supabaseClient.js";

export async function getSession(){
  const sb = getSupabase();
  const { data, error } = await sb.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function requireSessionOrRedirect(){
  const session = await getSession();
  if (!session) {
    const isLogin = location.pathname.endsWith("/admin/login.html");
    if (!isLogin) location.href = "/admin/login.html";
    return null;
  }
  return session;
}

export async function signInWithPassword(email, password){
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithOtp(email){
  const sb = getSupabase();
  const { data, error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${location.origin}/admin/` }
  });
  if (error) throw error;
  return data;
}

export async function resetPassword(email){
  const sb = getSupabase();
  const { data, error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${location.origin}/admin/login.html`
  });
  if (error) throw error;
  return data;
}

export async function signOut(){
  const sb = getSupabase();
  const { error } = await sb.auth.signOut();
  if (error) throw error;
}
