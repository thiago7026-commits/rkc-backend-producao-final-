-- 040_admin_rbac_policies.sql

-- Safety
begin;

-- 1) helper: current user id
create or replace function public.current_uid()
returns uuid
language sql
stable
as $$
  select auth.uid();
$$;

-- 2) helper: is_admin (by roles)
create or replace function public.is_admin(p_uid uuid)
returns boolean
language plpgsql
stable
as $$
declare
  has_roles boolean := false;
  ok boolean := false;
begin
  -- detect if roles tables exist
  select exists (
    select 1 from information_schema.tables
    where table_schema='public' and table_name in ('user_roles','roles')
  ) into has_roles;

  if has_roles then
    -- checks common RBAC schema: user_roles(user_id, role_id) + roles(id, name)
    -- also supports user_roles(user_id, role) if role stored as text
    begin
      -- variant 1: user_roles.role_id -> roles.id (roles.name or roles.nome)
      select exists (
        select 1
        from public.user_roles ur
        join public.roles r on r.id = ur.role_id
        where ur.user_id = p_uid
          and lower(coalesce(r.name, r.nome)) in ('admin','alfa','owner','superadmin')
      ) into ok;
      if ok then return true; end if;
    exception when undefined_column or undefined_table then
      -- ignore and try variant 2
      null;
    end;

    begin
      -- variant 2: user_roles.role or user_roles.role_name (text)
      select exists (
        select 1
        from public.user_roles ur
        where ur.user_id = p_uid
          and lower(coalesce(ur.role, ur.role_name)) in ('admin','alfa','owner','superadmin')
      ) into ok;
      if ok then return true; end if;
    exception when undefined_column or undefined_table then
      null;
    end;

    begin
      -- variant 3 (optional): permissoes table + roles link
      select exists (
        select 1
        from public.user_roles ur
        join public.roles r on r.id = ur.role_id
        join public.permissoes p on lower(p.role_name) = lower(coalesce(r.name, r.nome))
        where ur.user_id = p_uid
          and p.permitido = true
          and lower(p.role_name) in ('admin','alfa','owner','superadmin')
      ) into ok;
      if ok then return true; end if;
    exception when undefined_column or undefined_table then
      null;
    end;

    begin
      -- variant 4 (optional): permissoes table + user_roles.role_name
      select exists (
        select 1
        from public.user_roles ur
        join public.permissoes p on lower(p.role_name) = lower(coalesce(ur.role, ur.role_name))
        where ur.user_id = p_uid
          and p.permitido = true
          and lower(p.role_name) in ('admin','alfa','owner','superadmin')
      ) into ok;
      if ok then return true; end if;
    exception when undefined_column or undefined_table then
      null;
    end;
  end if;

  -- fallback: JWT claim "role" (if you later add it)
  begin
    if lower(coalesce(auth.jwt() ->> 'role','')) in ('admin','alfa','owner','superadmin') then
      return true;
    end if;
  exception when others then
    null;
  end;

  return false;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.is_admin(public.current_uid());
$$;

-- 3) RLS policies: anon/auth only published, admin full access
do $$
declare
  tbl text;
  published_predicate text;
  has_col boolean;
begin
  foreach tbl in array ['materias','projetos','pesquisas','equipe'] loop
    if not exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = tbl
    ) then
      continue;
    end if;

    published_predicate := '';

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = tbl and column_name = 'status'
    ) into has_col;
    if has_col then
      published_predicate := published_predicate || format('lower(%I) = %L', 'status', 'published');
    end if;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = tbl and column_name = 'published'
    ) into has_col;
    if has_col then
      if published_predicate <> '' then
        published_predicate := published_predicate || ' OR ';
      end if;
      published_predicate := published_predicate || format('%I = true', 'published');
    end if;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = tbl and column_name = 'publicado_transparencia'
    ) into has_col;
    if has_col then
      if published_predicate <> '' then
        published_predicate := published_predicate || ' OR ';
      end if;
      published_predicate := published_predicate || format('%I = true', 'publicado_transparencia');
    end if;

    select exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and table_name = tbl and column_name = 'ativo'
    ) into has_col;
    if has_col then
      if published_predicate <> '' then
        published_predicate := published_predicate || ' OR ';
      end if;
      published_predicate := published_predicate || format('%I = true', 'ativo');
    end if;

    if published_predicate = '' then
      continue;
    end if;

    execute format('alter table public.%I enable row level security', tbl);

    execute format('drop policy if exists admin_all on public.%I', tbl);
    execute format(
      'create policy admin_all on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      tbl
    );

    execute format('drop policy if exists public_select_published on public.%I', tbl);
    execute format(
      'create policy public_select_published on public.%I for select to anon using (%s)',
      tbl,
      published_predicate
    );

    execute format('drop policy if exists authenticated_select_published on public.%I', tbl);
    execute format(
      'create policy authenticated_select_published on public.%I for select to authenticated using (%s)',
      tbl,
      published_predicate
    );
  end loop;
end $$;

commit;
