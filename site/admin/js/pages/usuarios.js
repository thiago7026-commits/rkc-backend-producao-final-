import { CONFIG } from "../config.js";
import { listAll, getUserRoles, addRoleToUser, removeRoleFromUser } from "../api.js";
import { toast } from "../ui.js";

export async function renderUsuarios(ctx){
  if (!ctx.flags.admin) {
    return `<h1 class="h1">Usuários & Papéis</h1><p class="sub">Apenas admin pode acessar.</p>`;
  }

  const table = CONFIG.TABLES.profiles;
  const pf = CONFIG.FIELDS.profiles;

  let rows = [];
  try { rows = await listAll(table, pf.created_at || CONFIG.FIELDS.common.created_at); }
  catch(e){
    return `
      <h1 class="h1">Usuários & Papéis</h1>
      <p class="sub">Não consegui listar profiles. Ajuste CONFIG.TABLES.profiles (profiles/perfis).</p>
      <div class="card"><pre style="white-space:pre-wrap;">${e.message}</pre></div>
    `;
  }

  const htmlRows = rows.map(u=>{
    const id = u?.[pf.id];
    const email = u?.[pf.email] || "—";
    const nome = u?.[pf.nome] || "—";
    return `
      <tr>
        <td style="font-family:var(--mono); font-size:12px;">${id}</td>
        <td>${nome}<br/><small class="pill">${email}</small></td>
        <td>
          <button class="btn" data-roles="${id}">Ver Roles</button>
          <button class="btn primary" data-add="${id}">+ Role</button>
          <button class="btn danger" data-rem="${id}">- Role</button>
        </td>
      </tr>
    `;
  }).join("");

  const out = `
    <h1 class="h1">Usuários & Papéis</h1>
    <p class="sub">Gerencie papéis via RPCs do back-end (RBAC). Tabela: <code>${table}</code>.</p>

    <table class="table">
      <thead><tr><th>User ID</th><th>Perfil</th><th>Ações</th></tr></thead>
      <tbody>${htmlRows || `<tr><td colspan="3">Nenhum usuário.</td></tr>`}</tbody>
    </table>
  `;

  setTimeout(()=>{
    document.querySelectorAll("[data-roles]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const userId = b.getAttribute("data-roles");
        try{
          const roles = await getUserRoles(userId);
          toast("Roles", roles.join(", ") || "nenhuma");
        }catch(e){ toast("Erro", e.message); }
      });
    });
    document.querySelectorAll("[data-add]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const userId = b.getAttribute("data-add");
        const role = prompt("Qual role adicionar? (admin/editor/autor)", "editor");
        if (!role) return;
        try{
          await addRoleToUser(userId, role);
          toast("OK", `Role ${role} adicionada.`);
        }catch(e){ toast("Erro", e.message); }
      });
    });
    document.querySelectorAll("[data-rem]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const userId = b.getAttribute("data-rem");
        const role = prompt("Qual role remover? (admin/editor/autor)", "editor");
        if (!role) return;
        try{
          await removeRoleFromUser(userId, role);
          toast("OK", `Role ${role} removida.`);
        }catch(e){ toast("Erro", e.message); }
      });
    });
  }, 0);

  return out;
}
