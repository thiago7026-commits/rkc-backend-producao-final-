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
- [ ] Definir papéis (roles) e permissões por papel
- [ ] Definir permissões por módulo (ex.: Matérias, Projetos, Equipe)
- [ ] Definir permissões por ação (ex.: criar, editar, publicar, excluir)

---

## Banco de Dados (Supabase)
- [ ] Criar tabelas necessárias para:
  - [ ] Perfis de usuário/equipe
  - [ ] Papéis (roles)
  - [ ] Permissões
  - [ ] Associação usuário ⇄ papel/permissão
- [ ] Definir relacionamentos e constraints

---

## Segurança (RLS obrigatório)
- [ ] Ativar RLS nas tabelas que o admin manipula
- [ ] Criar políticas por papel/permissão:
  - [ ] Leitura
  - [ ] Inserção
  - [ ] Atualização
  - [ ] Remoção
- [ ] Garantir que usuário sem permissão não acessa nem via API

---

## API / Serviços
- [ ] Criar endpoints/serviços para:
  - [ ] Criar/gerenciar usuário da equipe
  - [ ] Atribuir/remover papéis
  - [ ] Atualizar permissões
- [ ] Padronizar erros (sem vazar dados sensíveis)

---

## Conteúdo (integração com o CMS do site)
- [ ] Garantir que Matérias/Projetos/Equipe podem ser geridos via admin
- [ ] Garantir que listagens públicas leem somente o que é público/publicado

---

## Ambientes e Deploy
- [ ] Definir variáveis de ambiente necessárias (Supabase URL/KEY)
- [ ] Garantir separação de ambiente (dev/prod) no Supabase
- [ ] Preparar migrations/seed (se aplicável)
