const form = document.querySelector("#resetForm");
const newPassword = document.querySelector("#newPassword");
const confirmPassword = document.querySelector("#confirmPassword");
const message = document.querySelector("#resetMessage");

const setMessage = (text, type = "info") => {
  if (!message) return;
  message.textContent = text;
  message.dataset.type = type;
};

const handleReset = async (event) => {
  event.preventDefault();
  const password = newPassword?.value || "";
  const confirm = confirmPassword?.value || "";

  if (!password || !confirm) {
    setMessage("Preencha todos os campos.", "error");
    return;
  }
  if (password !== confirm) {
    setMessage("As senhas não conferem.", "error");
    return;
  }

  const supabase = window.getSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    setMessage(error.message || "Não foi possível atualizar a senha.", "error");
    return;
  }

  setMessage("Senha atualizada. Faça login novamente.", "success");
  await supabase.auth.signOut();
  setTimeout(() => {
    window.location.href = "/admin/admin-login.html";
  }, 1200);
};

if (form) {
  form.addEventListener("submit", handleReset);
}
