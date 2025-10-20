# 🎯 OKRs — Ciclo de Estudos e Desenvolvimento Full-Stack

---

## 💡 Objetivo 1 — Dominar arquitetura e boas práticas com Next.js 15

**KR1.1:** Implementar estrutura modular com `(PUBLIC)/(PRIVATE)`, `/lib`, `/services`, `/components/shared`, `/hooks`, `/contexts`.
**KR1.2:** Configurar SSR, SSG e revalidate nas páginas `/home` e `/noticias`.
**KR1.3:** Implementar tema dark/light persistente com `next-themes`.
**KR1.4:** Criar layouts responsivos com Tailwind e Radix UI.

📈 **Métrica de sucesso:** 100 % das rotas públicas e privadas renderizando corretamente com UI consistente.

---

## 🔐 Objetivo 2 — Aprender autenticação segura e controle de acesso

**KR2.1:** Integrar NextAuth com API Java (OAuth2).
**KR2.2:** Configurar middleware global para rotas públicas/privadas.
**KR2.3:** Criar `<RequireRole roles={['ADMIN']}>` para controle granular.
**KR2.4:** Proteger layout `(PRIVATE)` com token e roles do backend.

📈 **Métrica:** login funcional + dashboard protegido + `/403` ativo.

---

## ⚙️ Objetivo 3 — Gerenciar estados e ciclo de UI

**KR3.1:** Implementar Zustand store global.
**KR3.2:** Criar Contexts (`useModalContext`, `useSidebarContext`).
**KR3.3:** Adicionar hooks customizados (`usePermission`, `useUserTheme`).
**KR3.4:** Integrar `react-hot-toast` para feedbacks.

📈 **Métrica:** 90 % da UI controlada por estado global e contextos.

---

## 🧱 Objetivo 4 — Praticar backend com Java + PostgreSQL

**KR4.1:** Criar API Spring Boot com endpoints REST e OAuth2 JWT.
**KR4.2:** Conectar PostgreSQL via Docker Compose.
**KR4.3:** Armazenar usuários, roles e preferências de tema.
**KR4.4:** Retornar token + roles + theme no `/auth/exchange`.

📈 **Métrica:** autenticação funcionando entre front e back.

---

## 🌍 Objetivo 5 — Internacionalização e acessibilidade

**KR5.1:** Configurar `next-intl` com `[locale]` e `messages` (pt-BR/en).
**KR5.2:** Traduzir páginas e rotas dinamicamente.
**KR5.3:** Adicionar ARIA e padrões WCAG aos componentes Radix.

📈 **Métrica:** alternância de idioma e acessibilidade validadas.

---

## 📊 Objetivo 6 — Seguir metodologia ágil e medir progresso

**KR6.1:** Aplicar sprints semanais (planejamento → execução → review).
**KR6.2:** Gerenciar tarefas em board (To Do → Doing → Review → Done).
**KR6.3:** Manter `docs/changelog.md` atualizado por sprint.
**KR6.4:** Registrar retrospectiva de aprendizado.

📈 **Métrica:** 100 % das sprints documentadas e revisadas.

---

## 🧾 Revisão Trimestral

- **Ciclo:** 12 semanas (3 meses).
- **Revisão final:** avaliar OKRs, consolidar aprendizados e definir nova meta (ex.: integração contínua e testes automatizados).
