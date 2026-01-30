import { getSupabase } from "./supabaseClient.js";
import { CONFIG } from "./config.js";

export async function listAll(table, orderField = "created_at"){
  const sb = getSupabase();
  const { data, error } = await sb.from(table).select("*").order(orderField, { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createRow(table, payload){
  const sb = getSupabase();
  const { data, error } = await sb.from(table).insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateRow(table, idField, idValue, payload){
  const sb = getSupabase();
  const { data, error } = await sb.from(table).update(payload).eq(idField, idValue).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteRow(table, idField, idValue){
  const sb = getSupabase();
  const { error } = await sb.from(table).delete().eq(idField, idValue);
  if (error) throw error;
  return true;
}

// Publicação/visibilidade com fallback
export async function setPublishedMaterias(row, published){
  const t = CONFIG.TABLES.materias;
  const f = CONFIG.FIELDS.materias;
  const idf = CONFIG.FIELDS.common.id;
  const payload = {};
  if (f.status) payload[f.status] = published ? "published" : "draft";
  if (f.published_bool) payload[f.published_bool] = !!published;
  return updateRow(t, idf, row[idf], payload);
}

export async function setVisibleProjetos(row, visible){
  const t = CONFIG.TABLES.projetos;
  const f = CONFIG.FIELDS.projetos;
  const idf = CONFIG.FIELDS.common.id;
  const payload = {};
  if (f.publicado_transparencia) payload[f.publicado_transparencia] = !!visible;
  if (f.published_bool) payload[f.published_bool] = !!visible;
  return updateRow(t, idf, row[idf], payload);
}

export async function setActiveEquipe(row, active){
  const t = CONFIG.TABLES.equipe;
  const f = CONFIG.FIELDS.equipe;
  const idf = CONFIG.FIELDS.common.id;
  const payload = {};
  if (f.ativo) payload[f.ativo] = !!active;
  return updateRow(t, idf, row[idf], payload);
}

// Admin RPCs
export async function getUserRoles(userId){
  const sb = getSupabase();
  const { data, error } = await sb.rpc(CONFIG.RPC.get_user_roles, { user_id: userId });
  if (error) throw error;
  if (Array.isArray(data)) {
    if (typeof data[0] === "string") return data;
    if (typeof data[0] === "object") return data.map(x => x.role || x.role_name || x.name).filter(Boolean);
  }
  return [];
}

export async function addRoleToUser(userId, role){
  const sb = getSupabase();
  const { data, error } = await sb.rpc(CONFIG.RPC.add_role_to_user_admin, { user_id: userId, role });
  if (error) throw error;
  return data;
}

export async function removeRoleFromUser(userId, role){
  const sb = getSupabase();
  const { data, error } = await sb.rpc(CONFIG.RPC.remove_role_from_user_admin, { user_id: userId, role });
  if (error) throw error;
  return data;
}
