import { listAll } from "../api.js";
import { CONFIG } from "../config.js";

export async function renderDashboard(ctx){
  const { roles } = ctx;
  const counts = { materias: 0, projetos: 0, equipe: 0 };
  try { counts.materias = (await listAll(CONFIG.TABLES.materias)).length; } catch {}
  try { counts.projetos = (await listAll(CONFIG.TABLES.projetos)).length; } catch {}
  try { counts.equipe = (await listAll(CONFIG.TABLES.equipe)).length; } catch {}

  return `
    <h1 class="h1">Painel</h1>
    <p class="sub">Visão geral do /admin. Seu acesso é controlado por RBAC/RLS no Supabase.</p>

    <div class="grid">
      <div class="card">
        <div class="sub" style="margin:0 0 8px 0;">Matérias</div>
        <div style="font-size:32px;font-weight:900;">${counts.materias}</div>
      </div>
      <div class="card">
        <div class="sub" style="margin:0 0 8px 0;">Projetos</div>
        <div style="font-size:32px;font-weight:900;">${counts.projetos}</div>
      </div>
      <div class="card">
        <div class="sub" style="margin:0 0 8px 0;">Equipe</div>
        <div style="font-size:32px;font-weight:900;">${counts.equipe}</div>
      </div>
      <div class="card">
        <div class="sub" style="margin:0 0 8px 0;">Roles</div>
        <div style="font-family:var(--mono);">${(roles||[]).join(", ") || "—"}</div>
      </div>
    </div>
  `;
}
