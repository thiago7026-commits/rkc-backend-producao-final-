const logoutButton = document.querySelector("#btnLogout");

const handleLogout = async () => {
  try {
    const supabase = window.getSupabaseClient();
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Erro ao sair:", error);
  } finally {
    window.location.href = "/admin/admin-login.html";
  }
};

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout);
}
