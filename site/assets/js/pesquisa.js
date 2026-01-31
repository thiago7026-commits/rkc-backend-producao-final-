import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import {
  getPesquisaConteudoKV,
  buildPesquisaResumoFromKV,
} from "/assets/js/data/pesquisaConteudoKV.js";

function getSupabaseClient() {
  const env = window.__ENV__ || {};
  if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    console.warn("Supabase não configurado para a página pública.");
    return null;
  }
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
}

function normalizeTopicos(topicos) {
  if (!Array.isArray(topicos)) return [];
  return topicos.map((t) => ({
    titulo: t?.titulo || "",
    texto: t?.texto || "",
    imagem: t?.imagem || t?.imagem_url || "",
    imagem_creditos: t?.imagem_creditos || "",
  }));
}

function fillText(root, selector, value) {
  const el = root.querySelector(selector);
  if (el) el.textContent = value || "";
}

function renderTopicos(root, topicos) {
  const container = root.querySelector("[data-pesquisa-topicos]");
  if (!container) return;
  if (!topicos.length) {
    container.innerHTML = "";
    return;
  }

  const html = topicos
    .map((t) => {
      const credito = t.imagem_creditos
        ? `<p class="pesquisa-topico-credito">${t.imagem_creditos}</p>`
        : "";
      const imagem = t.imagem
        ? `<figure><img src="${t.imagem}" alt="${t.titulo || ""}"/>${credito}</figure>`
        : "";
      return `
        <article class="pesquisa-topico">
          <h3>${t.titulo || ""}</h3>
          ${imagem}
          <p>${t.texto || ""}</p>
        </article>
      `;
    })
    .join("");

  container.innerHTML = html;
}

async function fetchPesquisaBySlug(supabase, slug) {
  const { data, error } = await supabase
    .from("pesquisas")
    .select("*")
    .eq("slug", slug)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

async function fetchPesquisaById(supabase, pesquisaId) {
  const { data, error } = await supabase
    .from("pesquisas")
    .select("*")
    .eq("id", pesquisaId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function loadPesquisaPublic(root = document) {
  const target = root.querySelector("[data-pesquisa-id],[data-pesquisa-slug]") || root;
  const pesquisaId = target.getAttribute("data-pesquisa-id");
  const pesquisaSlug = target.getAttribute("data-pesquisa-slug");

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  let pesquisa = null;
  if (pesquisaId) pesquisa = await fetchPesquisaById(supabase, pesquisaId);
  if (!pesquisa && pesquisaSlug) pesquisa = await fetchPesquisaBySlug(supabase, pesquisaSlug);
  if (!pesquisa) throw new Error("Pesquisa não encontrada.");

  const rows = await getPesquisaConteudoKV(supabase, pesquisa.id);
  pesquisa.pesquisaResumo = buildPesquisaResumoFromKV(rows);
  pesquisa.pesquisaResumo.topicos = normalizeTopicos(pesquisa.pesquisaResumo.topicos);

  fillText(target, "[data-pesquisa-resumo]", pesquisa.pesquisaResumo.resumo);
  fillText(target, "[data-pesquisa-introducao-titulo]", pesquisa.pesquisaResumo.introducao?.titulo);
  fillText(target, "[data-pesquisa-introducao-texto]", pesquisa.pesquisaResumo.introducao?.texto);
  fillText(target, "[data-pesquisa-citacao-texto]", pesquisa.pesquisaResumo.citacao?.texto);
  fillText(target, "[data-pesquisa-citacao-autor]", pesquisa.pesquisaResumo.citacao?.autor);
  renderTopicos(target, pesquisa.pesquisaResumo.topicos);

  window.__PESQUISA__ = pesquisa;
  document.dispatchEvent(new CustomEvent("pesquisa:loaded", { detail: pesquisa }));
  return pesquisa;
}
