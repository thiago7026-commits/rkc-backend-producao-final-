const ADMIN_EMAIL_ALFA = "SEU_EMAIL_AQUI@dominio.com";

const waitForSupabaseClient = async () => {
  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (window.getSupabaseClient && window.supabase) {
      return window.getSupabaseClient();
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error("Supabase client não inicializado.");
};

const redirectToLogin = (reason) => {
  const url = new URL("/admin/admin-login.html", window.location.origin);
  if (reason) url.searchParams.set("reason", reason);
  window.location.href = url.toString();
};

const runGuard = async () => {
  try {
    const supabase = await waitForSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    const session = data?.session;
    if (!session) {
      redirectToLogin("session");
      return;
    }

    const email = session.user?.email || "";
    if (email !== ADMIN_EMAIL_ALFA) {
      await supabase.auth.signOut();
      redirectToLogin("forbidden");
      return;
    }

    const whoami = document.querySelector("#whoami");
    if (whoami) whoami.textContent = email;
  } catch (error) {
    console.error("Erro ao validar sessão:", error);
    redirectToLogin("session");
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", runGuard);
} else {
  runGuard();
}
