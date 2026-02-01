import { supabase } from "/js/supabaseClient.js";

const form = document.getElementById("adminLoginForm");
const message = document.getElementById("loginMessage");

const setMessage = (text, isError = false) => {
  message.textContent = text;
  message.style.color = isError ? "#fca5a5" : "#86efac";
};

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setMessage("");

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    setMessage(error.message || "Falha ao entrar. Verifique seus dados.", true);
    return;
  }

  window.location.href = "/admin/";
});
