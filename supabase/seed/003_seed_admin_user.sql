
begin;

-- Vincular o usuário (auth.users) ao papel admin via user_roles
-- (idempotente: não duplica)
insert into public.user_roles (user_id, role_id)
select
  'c403d55e-ea8a-4efa-b965-74ba083b081b'::uuid as user_id,
  r.id as role_id
from public.roles r
where r.nome = 'admin'
on conflict (user_id, role_id) do nothing;

commit;
