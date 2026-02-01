// Auth helpers for admin login using Supabase Auth.
// Requires env script to expose SUPABASE_URL and SUPABASE_ANON_KEY.

import { supabase } from "./supabaseClient.js";

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function requireAdmin() {
  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    window.location.href = "/login.html";
    return;
  }

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role:roles(name)")
    .eq("user_id", session.user.id);

  if (rolesError) {
    console.error("[requireAdmin]", rolesError);
    window.location.href = "/login.html";
    return;
  }

  const isAdmin = (roles || []).some((entry) => entry?.role?.name === "admin");

  if (!isAdmin) {
    window.location.href = "/login.html";
  }
}
