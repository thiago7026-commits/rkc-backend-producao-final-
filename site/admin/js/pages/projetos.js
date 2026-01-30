import { CONFIG } from "../config.js";
import { listAll, createRow, updateRow, deleteRow, setVisibleProjetos } from "../api.js";
import { openModal, closeModal, toast, badge } from "../ui.js";

function visibleBadge(row){
  const f = CONFIG.FIELDS.projetos;
  const v = (f.publicado_transparencia && row?.[f.publicado_transparencia] === true) || (f.published_bool && row?.[f.published_bool] === true);
  return v ? badge("visível", true) : badge("oculto", false);
}

function formHTML(row = {}){
  const f = CONFIG.FIELDS.projetos;
  const id = row?.[CONFIG.FIELDS.common.id];
  const v = (k)=> row?.[k] ?? "";
  return `
    <div class="head">
      <h3>${id ? "Editar Projeto" : "Novo Projeto"}</h3>
      <button class="btn" id="pClose">Fechar</button>
    </div>
    <div class="hr"></div>

    <div class="grid">
      <div>
        <label>Título</label>
        <input id="pTitulo" value="${String(v(f.titulo)).replaceAll('"','&quot;')}"/>
      </div>
      <div>
        <label>Slug</label>
        <input id="pSlug" value="${String(v(f.slug)).replaceAll('"','&quot;')}" placeholder="ex: oficina"/>
      </div>
      <div>
        <label>Resumo</label>
        <textarea id="pResumo">${v(f.resumo)}</textarea>
      </div>
      <div>
        <label>URL da capa</label>
        <input id="pCapa" value="${String(v(f.capa_url)).replaceAll('"','&quot;')}" placeholder="https://..."/>
      </div>
    </div>

    <div style="margin-top:12px;">
      <label>Conteúdo</label>
      <textarea id="pConteudo">${v(f.conteudo)}</textarea>
    </div>

    <div class="foot">
      ${id ? `<button class="btn danger" id="pDelete">Excluir</button>` : ""}
      <button class="btn primary" id="pSave">Salvar</button>
    </div>
  `;
}

export async function renderProjetos(){
  const table = CONFIG.TABLES.projetos;
  const idf = CONFIG.FIELDS.common.id;

  let rows = [];
  try { rows = await listAll(table, CONFIG.FIELDS.common.created_at); }
  catch(e){
    return `
      <h1 class="h1">Projetos</h1>
      <p class="sub">Erro ao listar (RLS/policy ou nome da tabela/coluna).</p>
      <div class="card"><pre style="white-space:pre-wrap;">${e.message}</pre></div>
    `;
  }

  function openEditor(row){
    openModal(formHTML(row));
    document.getElementById("pClose").onclick = closeModal;

    document.getElementById("pSave").onclick = async ()=>{
      try{
        const f = CONFIG.FIELDS.projetos;
        const payload = {
          [f.titulo]: document.getElementById("pTitulo").value.trim(),
          [f.slug]: document.getElementById("pSlug").value.trim(),
          [f.resumo]: document.getElementById("pResumo").value.trim(),
          [f.capa_url]: document.getElementById("pCapa").value.trim(),
          [f.conteudo]: document.getElementById("pConteudo").value.trim(),
        };
        if (row?.[idf]) await updateRow(table, idf, row[idf], payload);
        else await createRow(table, payload);
        toast("Salvo", "Projeto salvo.");
        closeModal();
        location.reload();
      }catch(e){ toast("Erro", e.message); }
    };

    if (row?.[idf]) {
      document.getElementById("pDelete").onclick = async ()=>{
        if (!confirm("Excluir este projeto?")) return;
        try{
          await deleteRow(table, idf, row[idf]);
          toast("Excluído", "Projeto removido.");
          closeModal();
          location.reload();
        }catch(e){ toast("Erro", e.message); }
      };
    }
  }

  const f = CONFIG.FIELDS.projetos;
  const htmlRows = rows.map(r=>{
    const titulo = r?.[f.titulo] ?? "(sem título)";
    const slug = r?.[f.slug] ?? "—";
    return `
      <tr>
        <td>${titulo}<br/><small class="pill">slug: ${slug}</small></td>
        <td>${visibleBadge(r)}</td>
        <td style="white-space:nowrap; display:flex; gap:8px;">
          <button class="btn" data-edit="${r[idf]}">Editar</button>
          <button class="btn warn" data-vis="${r[idf]}">Visível/Oculto</button>
        </td>
      </tr>
    `;
  }).join("");

  const out = `
    <h1 class="h1">Projetos</h1>
    <p class="sub">Público só vê publicado_transparencia=true (fallback published=true).</p>

    <div class="toolbar">
      <div class="tools-left"><button class="btn primary" id="btnNewP">+ Novo Projeto</button></div>
      <div class="tools-right"><span class="pill">tabela: ${table}</span></div>
    </div>

    <table class="table">
      <thead><tr><th>Título</th><th>Visibilidade</th><th>Ações</th></tr></thead>
      <tbody>${htmlRows || `<tr><td colspan="3">Nenhum projeto.</td></tr>`}</tbody>
    </table>
  `;

  setTimeout(()=>{
    document.getElementById("btnNewP").onclick = ()=> openEditor({});
    document.querySelectorAll("[data-edit]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-edit");
        const row = rows.find(x => String(x[idf]) === String(id));
        openEditor(row);
      });
    });
    document.querySelectorAll("[data-vis]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const id = b.getAttribute("data-vis");
        const row = rows.find(x => String(x[idf]) === String(id));
        if (!row) return;
        try{
          const current = (f.publicado_transparencia && row?.[f.publicado_transparencia] === true) || (f.published_bool && row?.[f.published_bool] === true);
          await setVisibleProjetos(row, !current);
          toast("OK", !current ? "Projeto visível" : "Projeto oculto");
          location.reload();
        }catch(e){ toast("Erro", e.message); }
      });
    });
  }, 0);

  return out;
}
