# 🗺️ Roadmap de Estudos e Desenvolvimento (Next.js + Java + PostgreSQL)

> **Objetivo Geral:** estudar e praticar todo o ciclo de desenvolvimento moderno — front-end (Next.js 15), back-end (Java Spring Boot), banco de dados (PostgreSQL) e metodologias ágeis (Scrum/Kanban).

---

## 🚀 Etapas Principais (12 Semanas)

| Fase | Duração | Objetivo | Entregáveis |
|------|----------|-----------|--------------|
| **1. Planejamento e Setup** | 1 semana | Definir ambiente, docker e estrutura de pastas | - Estrutura `src/` completa<br>- Docker Compose rodando (Next.js + PostgreSQL)<br>- Documento de arquitetura<br>- Configuração do Git e README inicial |
| **2. Front-end Base (UI + SSR)** | 2 semanas | Construir base do Next.js com SSR, i18n e layout responsivo | - Layout `(PUBLIC)` e `(PRIVATE)`<br>- Header, Sidebar, ThemeToggle<br>- `/home` e `/noticias` SSR/CSR integrados |
| **3. Autenticação e Roles (NextAuth + API Java Mock)** | 2 semanas | Implementar login, register, forgot-password e controle de roles | - Login/Register integrados ao NextAuth<br>- Middleware e RequireRole operantes<br>- Página `/acesso-negado` funcionando |
| **4. Estado Global (Zustand + Contexts)** | 1 semana | Criar stores e contextos para UI e permissões | - `useSidebarContext`, `useModalContext`<br>- `zustand/app.store.ts` configurado |
| **5. Back-end Java + PostgreSQL** | 3 semanas | Construir API REST e autenticação OAuth2 JWT | - Endpoints `/auth/exchange`, `/users`, `/noticias`<br>- Conexão Docker PostgreSQL |
| **6. Integração e Refinamento (Strapi + .NET)** | 2 semanas | Integrar APIs adicionais e refinar UI | - `/noticias` e `/blog` com Strapi<br>- Dashboard com filtros e paginação |
| **7. Monitoramento e Deploy** | 1 semana | Implementar logs, métricas e deploy em Docker | - Build de produção<br>- `.env.production` e documentação de deploy |

---

## 🧭 Cronograma Ágil (Sprints Semanais)

| Sprint | Foco | Principais Entregas |
|---------|------|----------------------|
| **S1** | Setup & Documentação | Estrutura, Docker, README |
| **S2** | Layout Público | HeaderPublic, Home SSR, i18n |
| **S3** | Layout Privado | Sidebar, Dashboard, RequireRole |
| **S4** | Autenticação | Login, Register, Forgot Password |
| **S5** | Roles + Middleware | Proteção de rotas e /403 |
| **S6** | Zustand + Contexts | Estado global, UI reativa |
| **S7–S9** | Backend Java | API REST + PostgreSQL |
| **S10** | Integração real | Front + API Java |
| **S11** | Strapi + .NET | Fontes externas e gráficos |
| **S12** | Deploy e revisão | Otimizações e retrospectiva |

---

## 🧩 Ferramentas de Apoio

- **Planejamento:** Notion / Trello / Jira
- **Controle de Versão:** Git + GitHub (`main`, `develop`, `feature/*`)
- **Documentação:** `/docs` em Markdown
- **Ambiente:** Docker Compose (Next.js + PostgreSQL)
- **Metodologia:** Sprints de 1 semana + retrospectiva
- **Monitoramento futuro:** New Relic / Grafana

---

## 📅 Entrega Final

**Objetivo:** aplicação rodando em Docker com login funcional, dashboard privado, tema persistente e conteúdo SSR do Strapi.
**Prazo sugerido:** 12 semanas (3 meses).
