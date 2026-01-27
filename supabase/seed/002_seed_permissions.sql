
begin;

-- Seed de permissões base (idempotente)
-- Formato esperado: (modulo, acao, role, permitido)

insert into public.permissoes (modulo, acao, role, permitido)
values
  -- MATERIAS
  ('materias', 'ler',     'autor',  true),
  ('materias', 'criar',   'autor',  true),
  ('materias', 'editar',  'autor',  true),
  ('materias', 'excluir', 'autor',  true),

  ('materias', 'ler',     'editor', true),
  ('materias', 'criar',   'editor', true),
  ('materias', 'editar',  'editor', true),
  ('materias', 'excluir', 'editor', true),

  ('materias', 'ler',     'admin',  true),
  ('materias', 'criar',   'admin',  true),
  ('materias', 'editar',  'admin',  true),
  ('materias', 'excluir', 'admin',  true),

  -- PROJETOS
  ('projetos', 'ler',     'editor', true),
  ('projetos', 'criar',   'editor', true),
  ('projetos', 'editar',  'editor', true),
  ('projetos', 'excluir', 'editor', true),

  ('projetos', 'ler',     'admin',  true),
  ('projetos', 'criar',   'admin',  true),
  ('projetos', 'editar',  'admin',  true),
  ('projetos', 'excluir', 'admin',  true),

  -- EQUIPE
  ('equipe',   'ler',     'editor', true),
  ('equipe',   'criar',   'editor', true),
  ('equipe',   'editar',  'editor', true),
  ('equipe',   'excluir', 'editor', true),

  ('equipe',   'ler',     'admin',  true),
  ('equipe',   'criar',   'admin',  true),
  ('equipe',   'editar',  'admin',  true),
  ('equipe',   'excluir', 'admin',  true)

on conflict (modulo, acao, role) do update
set permitido = excluded.permitido;

commit;
