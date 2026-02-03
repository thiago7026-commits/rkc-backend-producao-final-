const ADMIN_EMAIL_ALFA = "SEU_EMAIL_AQUI@dominio.com";

const elements = {
  form: document.querySelector("#loginForm"),
  email: document.querySelector("#email"),
  password: document.querySelector("#password"),
  message: document.querySelector("#loginMessage"),
  reset: document.querySelector("#btnReset"),
};

const setMessage = (text, type = "info") => {
  if (!elements.message) return;
  elements.message.textContent = text;
  elements.message.dataset.type = type;
};

const handleExistingSession = async () => {
  const supabase = window.getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) return;
  const session = data?.session;
  if (session?.user?.email === ADMIN_EMAIL_ALFA) {
    window.location.href = "/admin/index.html";
  }
};

const handleLogin = async (event) => {
  event.preventDefault();
  const email = elements.email?.value?.trim() || "";
  const password = elements.password?.value || "";

  if (!email || !password) {
    setMessage("Informe e-mail e senha.", "error");
    return;
  }

  const supabase = window.getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setMessage(error.message || "Falha no login.", "error");
    return;
  }

  const sessionEmail = data?.session?.user?.email || "";
  if (sessionEmail !== ADMIN_EMAIL_ALFA) {
    await supabase.auth.signOut();
    setMessage("Acesso negado: usuário não autorizado.", "error");
    return;
  }

  window.location.href = "/admin/index.html";
};

const handleResetPassword = async () => {
  const email = elements.email?.value?.trim() || "";
  if (!email) {
    setMessage("Informe o e-mail para recuperar a senha.", "error");
    return;
  }
  const supabase = window.getSupabaseClient();
  const redirectTo = `${window.location.origin}/admin/redefinir-senha.html`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) {
    setMessage(error.message || "Não foi possível enviar o e-mail de recuperação.", "error");
    return;
  }
  setMessage("E-mail de recuperação enviado. Verifique sua caixa de entrada.", "success");
};

const handleReasonMessage = () => {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get("reason");
  if (reason === "session") {
    setMessage("Faça login para continuar.", "info");
  }
  if (reason === "forbidden") {
    setMessage("Acesso restrito para este e-mail.", "error");
  }
};

const init = async () => {
  handleReasonMessage();
  try {
    await handleExistingSession();
  } catch (error) {
    console.error(error);
  }
};

if (elements.form) {
  elements.form.addEventListener("submit", handleLogin);
}

if (elements.reset) {
  elements.reset.addEventListener("click", handleResetPassword);
}

init();
