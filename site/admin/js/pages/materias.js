import { CONFIG } from "../config.js";
import { listAll, createRow, updateRow, deleteRow, setPublishedMaterias } from "../api.js";
import { openModal, closeModal, toast, badge } from "../ui.js";

function statusBadge(row){
  const f = CONFIG.FIELDS.materias;
  const s = row?.[f.status];
  const pb = f.published_bool ? !!row?.[f.published_bool] : false;
  const published = (s === "published") || (pb === true);
  return published ? badge("published", true) : badge("draft", false);
}

function formHTML(row = {}){
  const f = CONFIG.FIELDS.materias;
  const id = row?.[CONFIG.FIELDS.common.id];
  const v = (k)=> row?.[k] ?? "";
  return `
    <div class="head">
      <h3>${id ? "Editar Matéria" : "Nova Matéria"}</h3>
      <button class="btn" id="mClose">Fechar</button>
    </div>
    <div class="hr"></div>

    <div class="grid">
      <div>
        <label>Título</label>
        <input id="mTitulo" value="${String(v(f.titulo)).replaceAll('"','&quot;')}"/>
      </div>
      <div>
        <label>Slug</label>
        <input id="mSlug" value="${String(v(f.slug)).replaceAll('"','&quot;')}" placeholder="ex: minha-materia"/>
      </div>
      <div>
        <label>Resumo</label>
        <textarea id="mResumo">${v(f.resumo)}</textarea>
      </div>
      <div>
        <label>URL da capa</label>
        <input id="mCapa" value="${String(v(f.capa_url)).replaceAll('"','&quot;')}" placeholder="https://..."/>
      </div>
    </div>

    <div style="margin-top:12px;">
      <label>Conteúdo</label>
      <textarea id="mConteudo">${v(f.conteudo)}</textarea>
      <div class="sub" style="margin-top:6px;">Depois você pode trocar esse textarea por editor rico.</div>
    </div>

    <div class="foot">
      ${id ? `<button class="btn danger" id="mDelete">Excluir</button>` : ""}
      <button class="btn primary" id="mSave">Salvar</button>
    </div>
  `;
}

export async function renderMaterias(){
  const table = CONFIG.TABLES.materias;
  const idf = CONFIG.FIELDS.common.id;

  let rows = [];
  try { rows = await listAll(table, CONFIG.FIELDS.common.created_at); }
  catch(e){
    return `
      <h1 class="h1">Matérias</h1>
      <p class="sub">Erro ao listar (RLS/policy ou nome da tabela/coluna).</p>
      <div class="card"><pre style="white-space:pre-wrap;">${e.message}</pre></div>
    `;
  }

  function openEditor(row){
    openModal(formHTML(row));
    document.getElementById("mClose").onclick = closeModal;

    document.getElementById("mSave").onclick = async ()=>{
      try{
        const f = CONFIG.FIELDS.materias;
        const payload = {
          [f.titulo]: document.getElementById("mTitulo").value.trim(),
          [f.slug]: document.getElementById("mSlug").value.trim(),
          [f.resumo]: document.getElementById("mResumo").value.trim(),
          [f.capa_url]: document.getElementById("mCapa").value.trim(),
          [f.conteudo]: document.getElementById("mConteudo").value.trim(),
        };
        if (row?.[idf]) await updateRow(table, idf, row[idf], payload);
        else await createRow(table, payload);

        toast("Salvo", "Matéria salva.");
        closeModal();
        location.reload();
      }catch(e){ toast("Erro", e.message); }
    };

    if (row?.[idf]) {
      document.getElementById("mDelete").onclick = async ()=>{
        if (!confirm("Excluir esta matéria?")) return;
        try{
          await deleteRow(table, idf, row[idf]);
          toast("Excluída", "Matéria removida.");
          closeModal();
          location.reload();
        }catch(e){ toast("Erro", e.message); }
      };
    }
  }

  const f = CONFIG.FIELDS.materias;
  const htmlRows = rows.map(r=>{
    const titulo = r?.[f.titulo] ?? "(sem título)";
    const slug = r?.[f.slug] ?? "—";
    return `
      <tr>
        <td>${titulo}<br/><small class="pill">slug: ${slug}</small></td>
        <td>${statusBadge(r)}</td>
        <td style="white-space:nowrap; display:flex; gap:8px;">
          <button class="btn" data-edit="${r[idf]}">Editar</button>
          <button class="btn warn" data-pub="${r[idf]}">Publicar/Revogar</button>
        </td>
      </tr>
    `;
  }).join("");

  const out = `
    <h1 class="h1">Matérias</h1>
    <p class="sub">Público só vê published (status='published' ou published=true).</p>

    <div class="toolbar">
      <div class="tools-left">
        <button class="btn primary" id="btnNew">+ Nova Matéria</button>
      </div>
      <div class="tools-right">
        <span class="pill">tabela: ${table}</span>
      </div>
    </div>

    <table class="table">
      <thead><tr><th>Título</th><th>Status</th><th>Ações</th></tr></thead>
      <tbody>${htmlRows || `<tr><td colspan="3">Nenhuma matéria.</td></tr>`}</tbody>
    </table>
  `;

  setTimeout(()=>{
    document.getElementById("btnNew").onclick = ()=> openEditor({});
    document.querySelectorAll("[data-edit]").forEach(b=>{
      b.addEventListener("click", ()=>{
        const id = b.getAttribute("data-edit");
        const row = rows.find(x => String(x[idf]) === String(id));
        openEditor(row);
      });
    });
    document.querySelectorAll("[data-pub]").forEach(b=>{
      b.addEventListener("click", async ()=>{
        const id = b.getAttribute("data-pub");
        const row = rows.find(x => String(x[idf]) === String(id));
        if (!row) return;
        try{
          const current = (row?.[f.status] === "published") || (!!row?.[f.published_bool]);
          await setPublishedMaterias(row, !current);
          toast("OK", !current ? "Publicada" : "Voltando p/ draft");
          location.reload();
        }catch(e){ toast("Erro", e.message); }
      });
    });
  }, 0);

  return out;
}
