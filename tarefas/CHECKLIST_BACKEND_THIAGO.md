# Checklist de Entrega — Back-end (Admin + RBAC)

Responsável: Thiago Dias  
Stack: GitHub + Supabase  

---

## Autenticação (Supabase Auth)
- [ ] Definir método de login do admin (e-mail/senha)
- [ ] Configurar fluxos de sessão (login/logout/refresh)
- [ ] Definir regras de criação de usuário (quem cria: admin)

---

## Modelo de Acesso (RBAC)
- [x] Definir papéis (roles)
- [ ] Definir permissões por módulo (Matérias, Projetos, Equipe)
- [ ] Definir permissões por ação (criar, editar, publicar, excluir)

---

## Banco de Dados (Supabase)
- [x] Criar tabelas:
  - [x] Perfis de usuário
  - [x] Papéis (roles)
  - [ ] Permissões
  - [x] Associação usuário ⇄ papel (user_roles)
- [x] Definir relacionamentos e constraints
  - [x] FK user_roles.user_id → auth.users(id)
  - [x] FK user_roles.role_id → roles(id)

---

## Segurança (RLS)
- [x] Ativar RLS nas tabelas de RBAC
- [x] Criar políticas por papel:
  - [x] SELECT
  - [x] INSERT
  - [x] UPDATE
  - [x] DELETE
- [ ] Aplicar RLS nas tabelas de conteúdo do sistema

---

## RPCs / Funções
- [x] is_admin()
- [x] has_role(role_name)
- [x] get_my_roles()
- [x] get_user_roles(user_id)
- [x] add_role_to_user_admin(user_id, role)
- [x] remove_role_from_user_admin(user_id, role)

---

## API / Serviços
- [x] Gerenciamento de papéis via RPC
- [ ] Criar/gerenciar usuários da equipe
- [ ] Atualizar permissões
- [ ] Padronizar erros da API

---

## Conteúdo (CMS / Admin)
- [ ] CRUD de Matérias
- [ ] CRUD de Projetos
- [ ] CRUD de Equipe
- [ ] Leitura pública apenas de conteúdo publicado

---

## Ambientes e Deploy
- [ ] Definir variáveis de ambiente
- [ ] Separar dev / prod
- [ ] Preparar migrations / seed
