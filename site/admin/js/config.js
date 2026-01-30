export const CONFIG = {
  SUPABASE_URL: window?.__ENV__?.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: window?.__ENV__?.SUPABASE_ANON_KEY || "",

  TABLES: {
    materias: "materias",
    projetos: "projetos",
    equipe: "equipe",
    profiles: "profiles", // ou "perfis"
  },

  FIELDS: {
    common: {
      id: "id",
      created_at: "created_at",
      updated_at: "updated_at",
    },

    materias: {
      titulo: "titulo",
      slug: "slug",
      resumo: "resumo",
      conteudo: "conteudo",
      capa_url: "capa_url",
      status: "status",
      published_bool: "published",
    },

    projetos: {
      titulo: "titulo",
      slug: "slug",
      resumo: "resumo",
      conteudo: "conteudo",
      capa_url: "capa_url",
      publicado_transparencia: "publicado_transparencia",
      published_bool: "published",
    },

    equipe: {
      nome: "nome",
      funcao: "funcao",
      bio: "bio",
      foto_url: "foto_url",
      ativo: "ativo",
      linkedin: "linkedin",
      instagram: "instagram",
      site: "site",
    },

    profiles: {
      id: "id",
      email: "email",
      nome: "nome",
      created_at: "created_at",
    },
  },

  RPC: {
    is_admin: "is_admin",
    has_role: "has_role",
    get_my_roles: "get_my_roles",
    get_user_roles: "get_user_roles",
    add_role_to_user_admin: "add_role_to_user_admin",
    remove_role_from_user_admin: "remove_role_from_user_admin",
  },

  ROLES: {
    admin: "admin",
    editor: "editor",
    autor: "autor",
  },
};
