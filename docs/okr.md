# 🎯 OKRs — Ciclo de Estudos e Desenvolvimento Full-Stack (Next.js + Strapi + Java + . NET)

---

## 💡 Objetivo 1 — Dominar arquitetura modular com Next.js 15

**KR1.1:** Implementar estrutura `(PUBLIC)/(PRIVATE)` + `/lib`, `/services`, `/components/shared`.
**KR1.2:** Configurar SSR/SSG/revalidate nas páginas `/home` e `/noticias`.
**KR1.3:** Aplicar tema dark/light persistente (`next-themes`).
**KR1.4:** Implementar i18n com `next-intl` e rotas localizadas.

📈 **Métrica:** UI completa, temas funcionais e rotas multilíngues estáveis.

---

## 🔐 Objetivo 2 — Aprender autenticação segura com Strapi + NextAuth (+ futuro Java)

**KR2.1:** Integrar NextAuth ao Strapi (CredentialsProvider).
**KR2.2:** Adicionar campos extras em User (`theme`, `locale`).
**KR2.3:** Configurar middleware para rotas públicas/privadas.
**KR2.4:** Criar `<RequireRole roles={['ADMIN']}>` para controle granular.
**KR2.5:** Planejar migração para API Java (OAuth2 JWT) em fase posterior.

📈 **Métrica:** Login e cadastro Strapi operantes + sessão JWT com roles e tema.

---

## ⚙️ Objetivo 3 — Gerenciar estados e interação de UI

**KR3.1:** Implementar store global (Zustand).
**KR3.2:** Criar Contexts (`useModalContext`, `useSidebarContext`).
**KR3.3:** Integrar hooks customizados (`usePermission`, `useUserTheme`).
**KR3.4:** Usar `react-hot-toast` para feedback de ações.

📈 **Métrica:** 90 % da UI controlada via estado global e contextos.

---

## 🧱 Objetivo 4 — Aprofundar backend (Strapi + Java + PostgreSQL)

**KR4.1:** Configurar Strapi com roles, permissions e JWT.
**KR4.2:** Conectar PostgreSQL via Docker Compose.
**KR4.3:** Criar coleções dinâmicas (`noticias`, `blog`, `banners`).
**KR4.4:** Futuramente integrar API Java (Spring Boot) para autenticação corporativa.

📈 **Métrica:** Strapi operacional + conteúdo SSR integrado ao Next + banco PostgreSQL sincronizado.

---

## 🌍 Objetivo 5 — Internacionalização e acessibilidade

**KR5.1:** Traduzir interfaces (pt-BR/en) com `next-intl`.
**KR5.2:** Garantir padrões WCAG nos componentes Radix.
**KR5.3:** Adicionar switch de idioma e persistência de locale.

📈 **Métrica:** alternância de idioma sem recarregar e acessibilidade validadas.

---

## 📊 Objetivo 6 — Metodologia Ágil e Ciclo de Aprendizado

**KR6.1:** Executar sprints semanais (plan → dev → review).
**KR6.2:** Usar Trello/Notion para gestão de tarefas.
**KR6.3:** Atualizar `docs/changelog.md` a cada sprint.
**KR6.4:** Documentar retrospectivas e lições aprendidas.

📈 **Métrica:** 100 % das sprints com entregas revisadas e registradas.

---

## 🎯 Objetivo 7 — Controle ReBAC, Mensageria Dinâmica e Integração Assistida por IA

**KR7.1:** Implementar a hierarquia de controle ReBAC (Owner, Admin, Gestores de 1000, 100, 50, 10) e escopo de atuação restrito.
**KR7.2:** Desenvolver a Central de Notificações assíncrona no header com contador de mensagens e fila/pilha de exibição.
**KR7.3:** Desenhar os formulários dinâmicos de mensagens que se adaptam conforme o teor da solicitação (Permissões, Troca de turno, Acordo).
**KR7.4:** Desenvolver a integração do chatbot (WhatsApp/Telegram) assistida por IA para detecção de faltas e alocação automática de substitutos.

📈 **Métrica:** Hierarquia funcional, notificações operando com rotas paralelas e protótipo de chat WhatsApp assistido por IA.

---

## 🧾 Revisão Trimestral

- **Ciclo:** 12 semanas (3 meses).

- **Revisão final:** avaliar OKRs, consolidar aprendizados e definir nova meta:
    ➡ integração plena com APIs Java e . NET + monitoramento contínuo.