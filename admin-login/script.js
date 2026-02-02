import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/**
 * RKC - Admin Login (PROD)
 * - login via Supabase Auth
 * - valida admin via RPC is_admin()
 * - redireciona para /admin/
 * - não-admin: signOut + bloqueio
 */

// ✅ PREENCHA COM AS KEYS DE PRODUÇÃO
const SUPABASE_URL = "https://xbbdaekwrckokvxbmvml.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_RBhUw6EeYgd89wsLvEZYnw_Y6SgB2hh";

// Ajuste se seus paths forem diferentes
const ADMIN_URL = "/admin/";
const LOGIN_URL = "/admin-login/";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elements
const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("btnLogin");
const recoverLink = document.getElementById("recoverPassword");

function setMsg(text, type = "info") {
  msg.textContent = text || "";
  msg.dataset.type = type; // opcional: estilizar via CSS
}

function setLoading(isLoading) {
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Entrando..." : "Entrar";
}

async function rpcIsAdmin() {
  const { data, error } = await supabase.rpc("is_admin");
  if (error) return false;
  return data === true;
}

async function redirectIfAlreadyAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const ok = await rpcIsAdmin();
  if (ok) {
    window.location.href = ADMIN_URL;
    return;
  }

  // Sessão existe mas não é admin -> desloga e mantém no login
  await supabase.auth.signOut();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  setMsg("");

  if (!email || !password) {
    setMsg("Preencha usuário e senha.", "error");
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.session) {
      setMsg("Login inválido. Verifique seu e-mail e senha.", "error");
      return;
    }

    // 🔒 RBAC: só admin passa
    const ok = await rpcIsAdmin();
    if (!ok) {
      await supabase.auth.signOut();
      setMsg("Acesso restrito a administradores.", "error");
      return;
    }

    // ✅ Admin confirmado
    window.location.href = ADMIN_URL;
  } catch {
    setMsg("Erro inesperado ao tentar logar.", "error");
  } finally {
    setLoading(false);
  }
});

recoverLink.addEventListener("click", async (e) => {
  e.preventDefault();
  setMsg("");

  const email = document.getElementById("email").value.trim();
  if (!email) {
    setMsg("Digite seu e-mail para recuperar a senha.", "error");
    return;
  }

  // Requer redirect permitido/configurado no Supabase Auth
  const redirectTo = `${window.location.origin}${LOGIN_URL}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    setMsg("Não foi possível enviar o e-mail de recuperação.", "error");
    return;
  }

  setMsg("Se o e-mail estiver cadastrado, enviamos um link de recuperação.", "info");
});

// Boot
redirectIfAlreadyAdmin();
