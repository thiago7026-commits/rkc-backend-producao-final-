import { CONFIG } from "../config.js";
import { listAll, createRow, updateRow, deleteRow } from "../api.js";
import { getSupabase } from "../supabaseClient.js";
import { openModal, closeModal, toast } from "../ui.js";
import {
  getPesquisaConteudoKV,
  buildPesquisaResumoFromKV,
  upsertKV,
} from "/assets/js/data/pesquisaConteudoKV.js";

const escapeAttr = (value) => String(value ?? "").replaceAll('"', "&quot;");

function normalizeTopicos(topicos) {
  if (!Array.isArray(topicos)) return [];
  return topicos.map((t) => ({
    titulo: t?.titulo || "",
    texto: t?.texto || "",
    imagem: t?.imagem || t?.imagem_url || "",
    imagem_creditos: t?.imagem_creditos || "",
  }));
}

function topicoHTML(topico = {}) {
  return `
    <div class="card" data-topico>
      <div class="grid">
        <div>
          <label>Título do tópico</label>
          <input data-field="titulo" value="${escapeAttr(topico.titulo)}" />
        </div>
        <div>
          <label>URL da imagem</label>
          <input data-field="imagem" value="${escapeAttr(topico.imagem)}" placeholder="https://..." />
        </div>
        <div>
          <label>Créditos da imagem</label>
          <input data-field="imagem_creditos" value="${escapeAttr(topico.imagem_creditos)}" />
        </div>
      </div>
      <div style="margin-top:12px;">
        <label>Texto</label>
        <textarea data-field="texto">${topico.texto || ""}</textarea>
      </div>
      <div class="foot">
        <button class="btn danger" type="button" data-remove>Remover tópico</button>
      </div>
    </div>
  `;
}

function formHTML(row = {}, pr = {}) {
  const f = CONFIG.FIELDS.pesquisas;
  const id = row?.[CONFIG.FIELDS.common.id];
  const v = (k) => row?.[k] ?? "";
  const resumo = pr?.resumo || "";
  const introducao = pr?.introducao || {};
  const citacao = pr?.citacao || {};
  const topicos = normalizeTopicos(pr?.topicos || []);

  return `
    <div class="head">
      <h3>${id ? "Editar Pesquisa" : "Nova Pesquisa"}</h3>
      <button class="btn" id="pesquisaClose">Fechar</button>
    </div>
    <div class="hr"></div>

    <div class="grid">
      <div>
        <label>Título</label>
        <input id="pesquisaTitulo" value="${escapeAttr(v(f.titulo))}" />
      </div>
      <div>
        <label>Slug</label>
        <input id="pesquisaSlug" value="${escapeAttr(v(f.slug))}" placeholder="ex: pesquisa-2024" />
      </div>
    </div>

    <div style="margin-top:12px;">
      <label>Resumo</label>
      <textarea id="pesquisaResumo">${resumo}</textarea>
    </div>

    <div class="grid" style="margin-top:12px;">
      <div>
        <label>Título da introdução</label>
        <input id="introducaoTitulo" value="${escapeAttr(introducao.titulo || "")}" />
      </div>
      <div>
        <label>Texto da introdução</label>
        <textarea id="introducaoTexto">${introducao.texto || ""}</textarea>
      </div>
    </div>

    <div class="grid" style="margin-top:12px;">
      <div>
        <label>Texto da citação</label>
        <textarea id="citacaoTexto">${citacao.texto || ""}</textarea>
      </div>
      <div>
        <label>Autor da citação</label>
        <input id="citacaoAutor" value="${escapeAttr(citacao.autor || "")}" />
      </div>
    </div>

    <div style="margin-top:16px;">
      <div class="toolbar">
        <div class="tools-left">
          <h4 style="margin:0;">Tópicos</h4>
        </div>
        <div class="tools-right">
          <button class="btn" type="button" id="addTopico">+ Adicionar tópico</button>
        </div>
      </div>
      <div id="topicosContainer" style="display:flex; flex-direction:column; gap:12px;">
        ${topicos.map((t) => topicoHTML(t)).join("")}
      </div>
    </div>

    <div class="foot" style="margin-top:12px;">
      ${id ? `<button class="btn danger" id="pesquisaDelete">Excluir</button>` : ""}
      <button class="btn primary" id="pesquisaSave">Salvar</button>
    </div>
  `;
}

function collectTopicos() {
  return Array.from(document.querySelectorAll("[data-topico]")).map((el) => ({
    titulo: el.querySelector('[data-field="titulo"]').value.trim(),
    texto: el.querySelector('[data-field="texto"]').value.trim(),
    imagem: el.querySelector('[data-field="imagem"]').value.trim(),
    imagem_creditos: el.querySelector('[data-field="imagem_creditos"]').value.trim(),
  }));
}

export async function renderPesquisas() {
  const table = CONFIG.TABLES.pesquisas;
  const idf = CONFIG.FIELDS.common.id;
  const f = CONFIG.FIELDS.pesquisas;

  let rows = [];
  try {
    rows = await listAll(table, CONFIG.FIELDS.common.created_at);
  } catch (e) {
    return `
      <h1 class="h1">Pesquisas</h1>
      <p class="sub">Erro ao listar (RLS/policy ou nome da tabela/coluna).</p>
      <div class="card"><pre style="white-space:pre-wrap;">${e.message}</pre></div>
    `;
  }

  async function openEditor(row) {
    const supabase = getSupabase();
    openModal("<div class=\"card\">Carregando...</div>");

    let pesquisaResumo = { resumo: "", introducao: {}, citacao: {}, topicos: [] };
    if (row?.[idf]) {
      try {
        const rowsKV = await getPesquisaConteudoKV(supabase, row[idf]);
        pesquisaResumo = buildPesquisaResumoFromKV(rowsKV);
      } catch (e) {
        toast("Erro", e.message);
      }
    }

    openModal(formHTML(row, pesquisaResumo));
    document.getElementById("pesquisaClose").onclick = closeModal;

    document.getElementById("addTopico").onclick = () => {
      const container = document.getElementById("topicosContainer");
      container.insertAdjacentHTML("beforeend", topicoHTML({}));
      container.lastElementChild
        .querySelector("[data-remove]")
        .addEventListener("click", (event) => {
          event.currentTarget.closest("[data-topico]").remove();
        });
    };

    document.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.currentTarget.closest("[data-topico]").remove();
      });
    });

    document.getElementById("pesquisaSave").onclick = async () => {
      try {
        const titulo = document.getElementById("pesquisaTitulo").value.trim();
        const slug = document.getElementById("pesquisaSlug").value.trim();
        const resumo = document.getElementById("pesquisaResumo").value.trim();
        const introducaoTitulo = document.getElementById("introducaoTitulo").value.trim();
        const introducaoTexto = document.getElementById("introducaoTexto").value.trim();
        const citacaoTexto = document.getElementById("citacaoTexto").value.trim();
        const citacaoAutor = document.getElementById("citacaoAutor").value.trim();
        const topicos = collectTopicos();

        const payload = {
          [f.titulo]: titulo,
          [f.slug]: slug,
        };

        let savedRow = row;
        if (row?.[idf]) savedRow = await updateRow(table, idf, row[idf], payload);
        else savedRow = await createRow(table, payload);

        const pesquisaId = savedRow[idf];
        const pr = {
          resumo,
          introducao: { titulo: introducaoTitulo, texto: introducaoTexto },
          citacao: { texto: citacaoTexto, autor: citacaoAutor },
          topicos: topicos.map((t) => ({
            titulo: t.titulo || "",
            texto: t.texto || "",
            imagem: t.imagem || "",
            imagem_creditos: t.imagem_creditos || "",
          })),
        };

        await upsertKV(supabase, pesquisaId, "resumo", pr.resumo);
        await upsertKV(supabase, pesquisaId, "introducao_titulo", pr.introducao.titulo);
        await upsertKV(supabase, pesquisaId, "introducao_texto", pr.introducao.texto);
        await upsertKV(supabase, pesquisaId, "citacao_texto", pr.citacao.texto);
        await upsertKV(supabase, pesquisaId, "citacao_autor", pr.citacao.autor);
        await upsertKV(supabase, pesquisaId, "pesquisaResumo.topicos", JSON.stringify(pr.topicos));
        await upsertKV(supabase, pesquisaId, "pesquisaResumo", JSON.stringify(pr));

        for (let i = 0; i < pr.topicos.length; i += 1) {
          const n = String(i + 1).padStart(2, "0");
          const topico = pr.topicos[i];
          await upsertKV(supabase, pesquisaId, `topico_${n}_titulo`, topico.titulo);
          await upsertKV(supabase, pesquisaId, `topico_${n}_texto`, topico.texto);
          await upsertKV(
            supabase,
            pesquisaId,
            `topico_${n}_imagem_url`,
            topico.imagem,
            topico.imagem_creditos
          );
        }

        toast("OK", "Pesquisa atualizada com sucesso");
        closeModal();
        location.reload();
      } catch (e) {
        toast("Erro", e.message);
      }
    };

    if (row?.[idf]) {
      document.getElementById("pesquisaDelete").onclick = async () => {
        if (!confirm("Excluir esta pesquisa?")) return;
        try {
          await deleteRow(table, idf, row[idf]);
          toast("Excluída", "Pesquisa removida.");
          closeModal();
          location.reload();
        } catch (e) {
          toast("Erro", e.message);
        }
      };
    }
  }

  const htmlRows = rows
    .map((r) => {
      const titulo = r?.[f.titulo] ?? "(sem título)";
      const slug = r?.[f.slug] ?? "—";
      return `
        <tr>
          <td>${titulo}<br/><small class="pill">slug: ${slug}</small></td>
          <td style="white-space:nowrap; display:flex; gap:8px;">
            <button class="btn" data-edit="${r[idf]}">Editar</button>
          </td>
        </tr>
      `;
    })
    .join("");

  const out = `
    <h1 class="h1">Pesquisas</h1>
    <p class="sub">Conteúdo é salvo em pesquisa_conteudo (KV).</p>

    <div class="toolbar">
      <div class="tools-left"><button class="btn primary" id="btnNewPesquisa">+ Nova Pesquisa</button></div>
      <div class="tools-right"><span class="pill">tabela: ${table}</span></div>
    </div>

    <table class="table">
      <thead><tr><th>Título</th><th>Ações</th></tr></thead>
      <tbody>${htmlRows || `<tr><td colspan="2">Nenhuma pesquisa.</td></tr>`}</tbody>
    </table>
  `;

  setTimeout(() => {
    document.getElementById("btnNewPesquisa").onclick = () => openEditor({});
    document.querySelectorAll("[data-edit]").forEach((b) => {
      b.addEventListener("click", () => {
        const id = b.getAttribute("data-edit");
        const row = rows.find((x) => String(x[idf]) === String(id));
        openEditor(row);
      });
    });
  }, 0);

  return out;
}
