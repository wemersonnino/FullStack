# 🗺️ Roadmap de Estudos e Desenvolvimento (Next.js + Strapi + Java + . NET + PostgreSQL)

> **Objetivo Geral:** estudar e praticar todo o ciclo de desenvolvimento moderno — front-end (Next.js 15), back-end (Strapi CMS + Java Spring Boot + . NET), banco de dados (PostgreSQL) e metodologias ágeis (Scrum/Kanban).

---

## 🚀 Etapas Principais (12 Semanas)

|Fase|Duração|Objetivo|Entregáveis|
|---|---|---|---|
|**1. Planejamento e Setup**|1 semana|Definir ambiente, Docker e estrutura de pastas (Frontend + Backend)|- Estrutura `src/` completa - Docker Compose rodando (Next.js + Strapi + PostgreSQL) - Documento de arquitetura - Configuração do Git e README inicial|
|**2. Front-end Base (UI + SSR + i18n)**|2 semanas|Construir base do Next.js com SSR, `next-intl`, Tailwind e layout responsivo|- Layouts `(PUBLIC)` e `(PRIVATE)` - Header, Sidebar, ThemeToggle - Rotas multilíngues `/[locale]/home` e `/[locale]/noticias`|
|**3. CMS e Autenticação (Strapi + NextAuth)**|2 semanas|Configurar o Strapi como backend principal para cadastro, login, roles e temas|- Coleção `users` com roles customizadas - Integração NextAuth ↔ Strapi (CredentialsProvider) - Sessão JWT com `theme` e `locale`|
|**4. Estado Global (Zustand + Contexts)**|1 semana|Gerenciar UI, modais e sidebar global|- `useSidebarContext`, `useModalContext` - `zustand/app.store.ts` configurado|
|**5. Backend Java (Spring Boot + PostgreSQL)**|3 semanas|Desenvolver API REST para autenticação corporativa (OAuth2 JWT)|- Endpoints `/auth/exchange`, `/users`, `/noticias` - Conexão com PostgreSQL via Docker - Integração gradual com NextAuth|
|**6. Integração Avançada (.NET + Analytics)**|2 semanas|Criar serviços auxiliares (.NET) para dashboards e gráficos|- API .NET para relatórios - Integração com frontend via Axios e adapters|
|**7. Monitoramento e Deploy**|1 semana|Implementar logs, métricas e deploy em Docker|- Build de produção (Next + Strapi) - `.env.production` e documentação de deploy|
---

## 🧭 Cronograma Ágil (Sprints Semanais)

|Sprint|Foco|Principais Entregas|
|---|---|---|
|**S1**|Setup & Documentação|Estrutura de pastas, Docker, README|
|**S2**|Layout Público|HeaderPublic, Home SSR, i18n|
|**S3**|Layout Privado|Sidebar, Dashboard, RequireRole|
|**S4**|Strapi CMS + Auth|Login/Register, roles, temas|
|**S5**|NextAuth Integração|Sessão JWT, /403, middleware|
|**S6**|Zustand + Contexts|Estado global e UI reativa|
|**S7–S9**|Backend Java|API REST + PostgreSQL|
|**S10**|Integração Front ↔ Java|Fluxo de login unificado|
|**S11**|Serviços .NET|Relatórios e analytics|
|**S12**|Deploy e Revisão|Build final e retrospectiva|
|**S13**|Hierarquia & ReBAC|Estrutura de níveis de gestão (Jethro model) e permissões centralizadas em ADMIN/OWNER|
|**S14**|Notificações e Mensagens|Central de Notificações no Header, Parallel Routes, Modais e Forms Dinâmicos|
|**S15**|IA Chat & RH Sync|Integração de WhatsApp/Telegram + Engine IA de sugestão e relatórios de RH|

---

## 🧩 Ferramentas de Apoio

- **Planejamento:** Obsidian / Trello / Jira
- **Controle de Versão:** Git + GitHub (`main`, `develop`, `feature/*`)
- **Documentação:** `/docs` em Markdown
- **Ambiente:** Docker Compose (Next.js + PostgreSQL)
- **Metodologia:** Sprints de 1 semana + retrospectiva
- **Monitoramento futuro:** New Relic / Grafana

---

## 📅 Entrega Final

**Objetivo:** Aplicação full-stack em Docker com login funcional, dashboard privado com abas para Setores/Postos e Capacidade Mínima, delegação ReBAC avançada, central de mensagens dinâmica, e integração simulada/webhook com chatbot assistido por IA.
**Prazo sugerido:** 15 semanas.
