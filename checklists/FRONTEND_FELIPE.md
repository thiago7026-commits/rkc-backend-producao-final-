# Checklist — Front-end (Felipe) — PROD

Responsável: Felipe  
Stack: (definir)  
Ambiente: **PRODUÇÃO (único ambiente oficial)**

---

## Páginas
- [ ] Home
- [ ] Quem Somos
- [ ] Projetos (listagem + página do projeto)
- [ ] Matérias (listagem + página da matéria)
- [ ] Newsletter
- [ ] Contato

---

## Integrações com Supabase
- [ ] Consumo de leitura pública:
  - [ ] Matérias: apenas `status='published'`
  - [ ] Projetos: apenas `publicado_transparencia=true`
  - [ ] Equipe: apenas `ativo=true`
- [ ] Painel admin:
  - [ ] Login (admin/editor/autor)
  - [ ] CRUD Matérias via RPC
  - [ ] CRUD Projetos via RPC
  - [ ] CRUD Equipe via RPC

---

## Qualidade
- [ ] Responsivo (mobile first)
- [ ] SEO básico
- [ ] Acessibilidade (alt-text, contraste)
- [ ] Tratamento de erros (mensagens vindas do padrão da API)
