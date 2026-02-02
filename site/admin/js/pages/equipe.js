import { CONFIG } from "../config.js";
import { listAll, createRow, updateRow, deleteRow, setActiveEquipe } from "../api.js";
import { openModal, closeModal, toast, badge } from "../ui.js";

function activeBadge(row){
  const f = CONFIG.FIELDS.equipe;
  const on = row?.[f.ativo] === true;
  return on ? badge("ativo", true) : badge("inativo", false);
}

function formHTML(row = {}){
  const f = CONFIG.FIELDS.equipe;
  const id = row?.[CONFIG.FIELDS.common.id];
  const v = (k)=> row?.[k] ?? "";
  return `
    <div class="head">
      <h3>${id ? "Editar Integrante" : "Novo Integrante"}</h3>
      <button class="btn" id="eClose">Fechar</button>
    </div>
    <div class="hr"></div>

    <div class="grid">
      <div>
        <label>Nome</label>
        <input id="eNome" value="${String(v(f.nome)).replaceAll('"','&quot;')}"/>
      </div>
      <div>
        <label>Função</label>
        <input id="eFuncao" value="${String(v(f.funcao)).replaceAll('"','&quot;')}" placeholder="ex: Jornalista / Design"/>
      </div>
      <div>
        <label>Foto (URL)</label>
        <input id="eFoto" value="${String(v(f.foto_url)).replaceAll('"','&quot;')}" placeholder="https://..."/>
      </div>
      <div>
        <label>LinkedIn</label>
        <input id="eLinkedin" value="${String(v(f.linkedin)).replaceAll('"','&quot;')}" placeholder="https://linkedin.com/in/..."/>
      </div>
      <div>
        <label>Instagram</label>
        <input id="eInstagram" value="${String(v(f.instagram)).replaceAll('"','&quot;')}" placeholder="https://instagram.com/..."/>
      </div>
      <div>
        <label>Site</label>
        <input id="eSite" value="${String(v(f.site)).replaceAll('"','&quot;')}" placeholder="https://..."/>
      </div>
    </div>

    <div style="margin-top:12px;">
      <label>Bio</label>
      <textarea id="eBio">${v(f.bio)}</textarea>
    </div>

    <div class="foot">
      ${id ? `<button class="btn danger" id="eDelete">Excluir</button>` : ""}
      <button class="btn primary" id="eSave">Salvar</button>
    </div>
  `;
}

export async function renderEquipe(){
  const table = CONFIG.TABLES.equipe;
  const idf = CONFIG.FIELDS.common.id;

  let rows = [];
  try { rows = await listAll(table, CONFIG.FIELDS.common.created_at); }
  catch(e){
    return `
      <h1 class="h1">Equipe</h1>
      <p class="sub">Erro ao listar (RLS/policy ou nome da tabela/coluna).</p>
      <div class="card"><pre style="white-space:pre-wrap;">${e.message}</pre></div>
    `;
  }

  function openEditor(row){
    openModal(formHTML(row));
    document.getElementById("eClose").onclick = closeModal;

    document.getElementById("eSave").onclick = async ()=>{
      try{
        const f = CONFIG.FIELDS.equipe;
        const payload = {
          [f.nome]: document.getElementById("eNome").value.trim(),
          [f.funcao]: document.getElementById("eFuncao").value.trim(),
          [f.foto_url]: document.getElementById("eFoto").value.trim(),
          [f.linkedin]: document.getElementById("eLinkedin").value.trim(),
          [f.instagram]: document.getElementById("eInstagram").value.trim(),
          [f.site]: document.getElementById("eSite").value.trim(),
          [f.bio]: document.getElementById("eBio").value.trim(),
        };
        if (row?.[idf]) await updateRow(table, idf, row[idf], payload);
        else await createRow(table, payload);
        toast("Salvo", "Integrante salvo.");
        closeModal();
        location.reload();
      }catch(e){ toast("Erro", e.message); }
    };

    if (row?.[idf]) {
      document.getElementById("eDelete").onclick = async ()=>{
        if (!confirm("Excluir este integrante?")) return;
        try{
          await deleteRow(table, idf, row[idf]);
          toast("Excluído", "Integrante removido.");
          closeModal();
          location.reload();
        }catch(e){ toast("Erro", e.message); }
      };
    }
  }

  const f = CONFIG.FIELDS.equipe;
  const htmlRows = rows.map(r=>{
    const nome = r?.[f.nome] ?? "(sem nome)";
    const funcao = r?.[f.funcao] ?? "—";
    return `
      <tr>
        <td>${nome}<br/><small class="pill">${funcao}</small></td>
        <td>${activeBadge(r)}</td>
        <td style="white-space:nowrap; display:flex; gap:8px;">
          <button class="btn" data-edit="${r[idf]}">Editar</button>
          <button class="btn warn" data-act="${r[idf]}">Ativo/Inativo</button>
        </td>
      </tr>
    `;
  }).join("");

  const out = `
    <h1 class="h1">Equipe</h1>
    <p class="sub">Público só vê ativo=true.</p>

    <div class="toolbar">
      <div class="tools-left"><button class="btn primary" id="btnNewE">+ Novo Integrante</button></div>
      <div class="tools-right"><span class="pill">tabela: ${table}</span></div>
    </div>

    <table class="table">
      <thead><tr><th>Nome</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>${htmlRows || `<tr><td colspan="3">Nenhum integrante.</td></tr>`}</tbody>
    </table>
  `;

  setTimeout(()=>{
    document.getElementById("btnNewE").onclick = ()=> openEditor({});
    document.querySelectorAll("[data-edit]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-edit");
        const row = rows.find(x => String(x[idf]) === String(id));
        openEditor(row);
      });
    });
    document.querySelectorAll("[data-act]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const id = b.getAttribute("data-act");
        const row = rows.find(x => String(x[idf]) === String(id));
        if (!row) return;
        try{
          const current = row?.[f.ativo] === true;
          await setActiveEquipe(row, !current);
          toast("OK", !current ? "Ativado" : "Desativado");
          location.reload();
        }catch(e){ toast("Erro", e.message); }
      });
    });
  }, 0);

  return out;
}
