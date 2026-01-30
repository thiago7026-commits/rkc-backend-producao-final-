/**
 * RKC - Admin Login
 * Aqui você vai integrar Supabase Auth depois:
 * - signInWithPassword
 * - resetPasswordForEmail
 */

const form = document.getElementById("loginForm");
const msg = document.getElementById("msg");
const btn = document.getElementById("btnLogin");

function setMsg(text){
  msg.textContent = text || "";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  setMsg("");
  btn.disabled = true;
  btn.textContent = "Entrando...";

  // Simulação de login (trocar pela integração Supabase)
  setTimeout(() => {
    if(!email || !password){
      setMsg("Preencha usuário e senha.");
      btn.disabled = false;
      btn.textContent = "Entrar";
      return;
    }

    // Sucesso simulado
    setMsg("Login em processamento (integrar com Supabase Auth).");
    btn.disabled = false;
    btn.textContent = "Entrar";
  }, 600);
});

document.getElementById("recoverPassword").addEventListener("click", (e) => {
  e.preventDefault();
  setMsg("Recuperação de senha: integrar com Supabase (resetPasswordForEmail).");
});
