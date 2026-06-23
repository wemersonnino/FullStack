# Cobertura Frontend x Backend

Data: 2026-06-23

## Critério

- Backend oficial: `Backend/java-app1/demo`.
- Frontend oficial: `Frontend/web-app3/escala`.
- Padrão alvo: `Page Server Component -> BFF -> service/adapter -> backend`, com componentes cliente recebendo dados por props e fazendo mutações por BFF.
- Rotas técnicas, como webhooks e health check, não exigem UI de produto, mas devem estar documentadas no Swagger.

## Cobertura por domínio

| Backend | UI/UX no frontend | BFF dedicado | Observação |
|---|---:|---:|---|
| Auth (`/api/v1/auth/**`) | Sim | Sim | Login, registro, recuperação, reset, Google e convite. |
| Users (`/api/v1/users/**`) | Sim | Sim/parcial | Perfil, senha, tema e gestão de roles em telas administrativas. |
| Companies (`/api/v1/companies/**`) | Sim | Sim | Gestão de empresas/tenants. |
| Employees (`/api/v1/employees/**`) | Sim | Sim | Team/colaboradores e cadastro. |
| Organization (`/api/v1/organization/**`) | Sim | Sim | Setores e projetos. |
| Work posts (`/api/v1/work-posts/**`) | Sim | Sim | Corrigido para BFF dedicado. |
| Operational capacities (`/api/v1/operational-capacities/**`) | Sim | Sim | Corrigido para BFF dedicado. |
| Escala (`/api/v1/escala/**`) | Sim | Sim | Calendário, admin e usuários escaláveis. |
| Schedules (`/api/v1/schedules/**`) | Sim | Sim | Geração, resumo e trocas. |
| Check-in (`/api/v1/check-in`) | Sim | Sim | Corrigido para BFF dedicado. |
| Reports (`/api/v1/reports/**`) | Sim | Sim | Export CSV corrigido para BFF. |
| Team invitations (`/api/v1/team/invitations/**`) | Sim | Sim | Convites internos e consulta pública por token. |
| Leads (`/api/v1/leads`) | Sim | Sim | Formulários públicos comerciais. |
| Contact (`/api/v1/public/contact`) | Sim | Sim | Página pública de contato. |
| Billing (`/api/v1/billing/**`) | Sim | Sim | Planos, checkout, assinatura e cancelamento. Webhook não precisa UI. |
| Messages (`/api/v1/messages/**`) | Sim | Sim | Header/modal de notificações corrigidos para BFF. |
| AI (`/api/v1/ai/**`) | Sim | Sim | Painel de IA via `/api/bff/ai/task`; serialização corrigida. |
| Learning progress (`/api/v1/learning-progress/**`) | Sim | Sim | Página `/dashboard/aprendizado` adicionada. |
| Stats (`/api/v1/stats/**`) | Sim | Sim | Summary do dashboard e métricas de marketing em `/dashboard/marketing`. |
| Chatbot webhook (`/api/v1/webhooks/chatbot`) | Não aplicável | Não | Endpoint de integração externa, documentado no Swagger. |
| Stripe webhook (`/api/v1/billing/webhook`) | Não aplicável | Não | Endpoint de integração externa, documentado no Swagger. |
| Actuator health (`/actuator/health`) | Não aplicável | Não | Endpoint operacional, documentado no Swagger. |

## Correções desta rodada

- Adicionados BFFs dedicados para mensagens, postos de trabalho, capacidades operacionais, aprendizado, stats, billing, check-in e convites por ID/token.
- Corrigido `/api/bff/ai/task` para enviar objeto JSON ao backend sem serialização dupla.
- Corrigido `/api/bff/reports/payroll/export` para proxy de CSV com headers de download.
- Componentes de mensagens, postos, capacidades, convites, check-in, billing e relatório passaram a consumir BFF em vez de backend direto.
- Adicionada UI de aprendizado em `/dashboard/aprendizado`.
- Migrados services/adapters legados de `/api/server/api/v1/**` para BFFs nomeados por domínio.
- Consolidada a duplicidade de escala removendo `/api/bff/escalas/**` e mantendo `/api/bff/escala/**` como rota canônica.
- Corrigido `StatsBackendAdapter` para usar URL absoluta quando executado em Server Component e encaminhar o token ao BFF.
- Adicionada UI administrativa de marketing para `GET /api/v1/stats/marketing`, com acesso limitado a `ADMIN`, `OWNER` e `MARKETING`.
- Corrigido o modal global de nova escala para permitir seleção do colaborador antes de salvar.
- Padronizada a resolução de avatar para `avatarUrl`, `avatar.url`, `image` e `picture` no header e sidebar.

## Pendências recomendadas

- Avaliar se o frontend ainda precisa de consulta individual de funcionário; o backend atual não expõe `GET /api/v1/employees/{id}`.
