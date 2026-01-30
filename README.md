# RKC — Back-end (PROD) — Supabase

Este repositório contém **somente o back-end** do projeto RKC (Supabase: banco, RLS, RPCs, seeds e documentação técnica).

> **Importante:** o front-end está em um repositório separado (Felipe).  
> A **junção** (merge) será feita depois, copiando as pastas e arquivos deste repo para o repositório final.

## Site estático (Hostinger)
- A pasta `site/` contém o conteúdo publicado em `public_html/` na Hostinger.
- As pastas `supabase/`, `docs/` e `checklists/` continuam no repo para backend e documentação.

---

## Ambiente oficial
- **Somente PRODUÇÃO (PROD)**
- Não existe ambiente DEV/staging oficial neste projeto.

Execução de mudanças no banco:
- **Supabase Dashboard → SQL Editor (navegador)**

---

## Estrutura do repositório

- `supabase/seed/`
  - Seeds idempotentes (roles, permissões, vínculo de admin)
- `supabase/policies/`
  - RLS policies por tabela (materias, projetos, equipe)
- `docs/`
  - Documentação técnica (ambiente, APIs/RPCs, RLS)
- `checklists/`
  - Checklist do back-end (PROD) + checklist do front (Felipe) + integração

---

## Como será feita a junção com o repositório final

Quando chegar a fase de integração, copiar do **repo de back-end** para o **repo final**:

- `supabase/seed/*`
- `supabase/policies/*`
- `docs/*`
- `checklists/*`
- `README.md` (conteúdo relevante)

O banco Supabase já estará configurado em PROD; estes arquivos servem como **fonte de verdade** e **auditoria** do que foi aplicado.

---

## Regras de segurança
- Nunca commitar chaves secretas (`sb_secret_*`) ou credenciais.
- Front-end usa apenas chave publicável/anon.
- Operações privilegiadas devem ser feitas via RPC + RBAC + RLS (no Supabase).
