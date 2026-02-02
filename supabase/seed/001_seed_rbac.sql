begin;

insert into public.roles (nome)
values ('admin'), ('editor'), ('autor')
on conflict (nome) do nothing;

commit;
