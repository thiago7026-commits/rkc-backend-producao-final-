import { CONFIG } from "./config.js";
import { $, toast, badge } from "./ui.js";
import { requireSessionOrRedirect, signInWithPassword, signInWithOtp, resetPassword, signOut } from "./auth.js";
import { getMyRoles, roleFlags } from "./rbac.js";
import { getRoute, onRouteChange, setRoute } from "./router.js";

import { renderDashboard } from "./pages/dashboard.js";
import { renderMaterias } from "./pages/materias.js";
import { renderProjetos } from "./pages/projetos.js";
import { renderEquipe } from "./pages/equipe.js";
import { renderUsuarios } from "./pages/usuarios.js";

function isLoginPage(){
  return location.pathname.endsWith("/admin/login.html");
}

function navItem(path, label, hint=""){
  const current = getRoute();
  const active = current === path ? "active" : "";
  return `<a href="#${path}" class="${active}"><span>${label}</span>${hint ? `<small>${hint}</small>` : ""}</a>`;
}

async function bootLogin(){
  try{
    const session = await requireSessionOrRedirect();
    if (session) location.href = "/admin/#/dashboard";
  }catch{}

  $("#btnLogin").onclick = async ()=>{
    try{
      const email = $("#email").value.trim();
      const pass = $("#password").value;
      if (!email || !pass) return toast("Atenção", "Preencha e-mail e senha.");
      await signInWithPassword(email, pass);
      toast("OK", "Login efetuado.");
      location.href = "/admin/#/dashboard";
    }catch(e){ toast("Erro", e.message); }
  };

  $("#btnMagic").onclick = async ()=>{
    try{
      const email = $("#email").value.trim();
      if (!email) return toast("Atenção", "Digite seu e-mail.");
      await signInWithOtp(email);
      toast("Enviado", "Cheque seu e-mail para o link de acesso.");
    }catch(e){ toast("Erro", e.message); }
  };

  $("#btnReset").onclick = async ()=>{
    try{
      const email = $("#email").value.trim();
      if (!email) return toast("Atenção", "Digite seu e-mail.");
      await resetPassword(email);
      toast("Enviado", "E-mail de recuperação enviado.");
    }catch(e){ toast("Erro", e.message); }
  };
}

async function bootApp(){
  const session = await requireSessionOrRedirect();
  if (!session) return;

  let roles = [];
  try { roles = await getMyRoles(); }
  catch { toast("RBAC", "Não consegui ler roles via RPC. Verifique RPC/policies."); }

  const flags = roleFlags(roles);

  const mePill = $("#mePill");
  if (mePill) mePill.textContent = session?.user?.email || session?.user?.id || "logado";

  const roleBadges = $("#roleBadges");
  if (roleBadges) roleBadges.innerHTML = (roles||[]).map(r => badge(r, true)).join(" ") || badge("sem role", false);

  $("#btnLogout").onclick = async ()=>{
    try { await signOut(); location.href = "/admin/login.html"; }
    catch(e){ toast("Erro", e.message); }
  };

  const nav = $("#nav");
  nav.innerHTML = [
    navItem("/dashboard", "Painel", "overview"),
    (flags.admin || flags.editor || flags.autor) ? navItem("/materias", "Matérias", "cms") : "",
    (flags.admin || flags.editor) ? navItem("/projetos", "Projetos", "site") : "",
    (flags.admin || flags.editor) ? navItem("/equipe", "Equipe", "site") : "",
    (flags.admin) ? navItem("/usuarios", "Usuários & Papéis", "rbac") : "",
  ].filter(Boolean).join("");

  const ctx = { session, roles, flags };

  async function render(){
    const route = getRoute();

    // guard simples: autor só dashboard/materias
    if (flags.autor && !(route === "/dashboard" || route === "/materias")) {
      setRoute("/materias");
      return;
    }

    const app = $("#app");
    try{
      if (route === "/dashboard") app.innerHTML = await renderDashboard(ctx);
      else if (route === "/materias") app.innerHTML = await renderMaterias(ctx);
      else if (route === "/projetos") app.innerHTML = await renderProjetos(ctx);
      else if (route === "/equipe") app.innerHTML = await renderEquipe(ctx);
      else if (route === "/usuarios") app.innerHTML = await renderUsuarios(ctx);
      else app.innerHTML = `<h1 class="h1">Não encontrado</h1><p class="sub">Rota: ${route}</p>`;

      nav.querySelectorAll("a").forEach(a=>{
        a.classList.toggle("active", a.getAttribute("href") === `#${getRoute()}`);
      });
    }catch(e){
      app.innerHTML = `<h1 class="h1">Erro</h1><div class="card"><pre style="white-space:pre-wrap;">${e.message}</pre></div>`;
    }
  }

  onRouteChange(render);
  await render();
}

(async ()=>{
  try{
    if (isLoginPage()) await bootLogin();
    else await bootApp();
  }catch(e){
    toast("Erro", e.message);
  }
})();
