# Checklist de Entrega — Back-end (Admin + RBAC) — PROD

Responsável: Thiago Dias  
Stack: GitHub + Supabase  
Ambiente: **PRODUÇÃO (único ambiente oficial)**

---

## 1. Autenticação (Supabase Auth)
- [x] Definir método de login do admin (e-mail/senha)
- [x] Configurar fluxos de sessão (login / logout / refresh)
- [x] Definir regras de criação de usuário (somente admin)

---

## 2. Modelo de Acesso (RBAC)
- [x] Definir papéis (roles)
- [x] Definir permissões por módulo (Matérias, Projetos, Equipe)
- [x] Definir permissões por ação (criar, editar, publicar, excluir)

---

## 3. Banco de Dados (Supabase)
- [x] Criar tabelas:
  - [x] Perfis de usuário (`profiles`)
  - [x] Papéis (`roles`)
  - [x] Permissões (`permissoes`)
  - [x] Associação usuário ⇄ papel (`user_roles`)
- [x] Definir relacionamentos e constraints
  - [x] FK `user_roles.user_id` → `auth.users(id)`
  - [x] FK `user_roles.role_id` → `roles(id)`

---

## 4. Segurança (RLS)
- [x] RLS ativado nas tabelas de RBAC
- [x] Policies criadas por papel:
  - [x] SELECT
  - [x] INSERT
  - [x] UPDATE
  - [x] DELETE
- [x] RLS aplicado às tabelas de conteúdo:
  - [x] `materias`
  - [x] `projetos`
  - [x] `equipe`

---

## 5. RPCs / Funções
- [x] `is_admin()`
- [x] `has_role(role_name)`
- [x] `get_my_roles()`
- [x] `get_user_roles(user_id)`
- [x] `add_role_to_user_admin(user_id, role)`
- [x] `remove_role_from_user_admin(user_id, role)`
- [x] Padronização de erros da API (`raise_api_error`)

---

## 6. API / Serviços
- [x] Gerenciamento de papéis via RPC
- [x] Criar / gerenciar usuários da equipe
- [x] Atualizar permissões via RPC
- [x] Padronizar erros da API

---

## 7. Conteúdo (CMS / Admin)
- [x] CRUD de Matérias
- [x] CRUD de Projetos
- [x] CRUD de Equipe
- [ ] Leitura pública apenas de conteúdo publicado (validação final)

---

## 8. Ambientes e Deploy
- [x] Definir variáveis de ambiente (PROD)
- [x] Decisão oficial: **sem ambiente DEV**
- [ ] Preparar migrations / seed versionados no Git
