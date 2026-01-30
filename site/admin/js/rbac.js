import { getSupabase } from "./supabaseClient.js";
import { CONFIG } from "./config.js";

export async function getMyRoles(){
  const sb = getSupabase();
  const { data, error } = await sb.rpc(CONFIG.RPC.get_my_roles);
  if (error) throw error;

  if (Array.isArray(data)) {
    if (typeof data[0] === "string") return data;
    if (typeof data[0] === "object") {
      return data.map(x => x.role || x.role_name || x.name).filter(Boolean);
    }
  }
  return [];
}

export async function isAdmin(){
  const sb = getSupabase();
  const { data, error } = await sb.rpc(CONFIG.RPC.is_admin);
  if (error) throw error;
  return !!data;
}

export function roleFlags(roles){
  const r = new Set((roles||[]).map(x => String(x).toLowerCase()));
  return {
    roles: [...r],
    admin: r.has(CONFIG.ROLES.admin),
    editor: r.has(CONFIG.ROLES.editor),
    autor: r.has(CONFIG.ROLES.autor),
  };
}
