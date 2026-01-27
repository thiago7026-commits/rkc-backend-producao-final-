# Checklist de Entrega — Back-end (Admin + RBAC) — PROD

Responsável: Thiago Dias  
Stack: GitHub + Supabase  
Ambiente: **PRODUÇÃO (único ambiente oficial)**

---

## 1. Autenticação (Supabase Auth)
- [x] Método de login do admin definido (e-mail/senha)
- [x] Fluxos de sessão funcionais (login / logout / refresh via Supabase)
- [x] Regras de criação de usuário definidas (somente admin)

---

## 2. Modelo de Acesso (RBAC)
- [x] Papéis (roles) definidos:
  - admin
  - editor
  - autor
- [x] Estrutura RBAC implementada no banco
- [ ] Permissões finalizadas por módulo:
  - [ ] Matérias
  - [ ] Projetos
  - [ ] Equipe
- [ ] Permissões finalizadas por ação:
  - [ ] criar
  - [ ] editar
  - [ ] publicar
  - [ ] excluir

---

## 3. Banco de Dados (Supabase)
- [x] Tabelas RBAC criadas:
  - [x] profiles
  - [x] roles
  - [x] user_roles
  - [x] permissoes
- [x] Relacionamentos e constraints definidos:
  - [x] user_roles.user_id → auth.users(id)
  - [x] user_roles.role_id → roles(id)

---

## 4. Segurança (RLS)
- [x] RLS ativado nas tabelas RBAC
- [x] Policies criadas por papel:
  - [x] SELECT
  - [x] INSERT
  - [x] UPDATE
  - [x] DELETE
- [ ] RLS aplicado às tabelas de conteúdo:
  - [ ] materias
  - [ ] projetos
  - [ ] equipe

---

## 5. RPCs / Funções
- [x] is_admin()
- [x] has_role(role_name)
- [x] get_my_roles()
- [x] get_user_roles(user_id)
- [x] add_role_to_user_admin(user_id, role)
- [x] remove_role_from_user_admin(user_id, role)
- [x] update_permission_admin(...)
- [x] raise_api_error(...)

---

## 6. API / Serviços
- [x] Gerenciamento de papéis via RPC
- [x] Criação e gestão de usuários da equipe (admin)
- [x] Atualização de permissões via RPC
- [x] **Erros da API padronizados**
  - code
  - message
  - http_status
  - details

---

## 7. Conteúdo (CMS / Admin)
- [ ] CRUD de Matérias
- [ ] CRUD de Projetos
- [ ] CRUD de Equipe
- [ ] Leitura pública restrita a conteúdo publicado

---

## 8. Ambientes e Deploy (PROD)
- [x] Variáveis de ambiente definidas
  - SUPABASE_URL
  - SUPABASE_ANON_KEY
  - SUPABASE_SERVICE_ROLE_KEY
- [x] Projeto único de produção definido (sem DEV)
- [ ] Migrations documentadas no repositório
- [ ] Seed documentado no repositório

---

## Status Geral
✅ RBAC funcional  
✅ Segurança aplicada  
✅ API padronizada  
⏳ CMS e conteúdo pendentes  
⏳ Migrations/seed pendentes
