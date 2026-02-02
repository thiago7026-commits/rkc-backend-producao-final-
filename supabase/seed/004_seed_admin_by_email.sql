begin;

-- Promove um usuário existente para admin/alfa pelo email
-- Troque o email abaixo antes de executar

do $$
declare
  target_email text := 'admin@example.com';
  target_uid uuid;
  role_id uuid;
begin
  -- localizar usuário no auth.users
  begin
    select id into target_uid
    from auth.users
    where email = target_email
    limit 1;
  exception when undefined_table then
    return;
  end;

  if target_uid is null then
    return;
  end if;

  -- localizar role admin/alfa
  begin
    select id into role_id
    from public.roles
    where lower(coalesce(nome, name)) in ('admin','alfa','owner','superadmin')
    limit 1;
  exception when undefined_table or undefined_column then
    return;
  end;

  if role_id is null then
    return;
  end if;

  -- vincular role ao usuário
  begin
    insert into public.user_roles (user_id, role_id)
    values (target_uid, role_id)
    on conflict (user_id, role_id) do nothing;
  exception when undefined_table or undefined_column then
    null;
  end;
end $$;

commit;
