# Cobertura Frontend x Backend

Data: 2026-06-30

## Criterio

- Backend oficial: `Backend/java-app1/demo`
- Frontend oficial: `Frontend/web-app3/escala`
- Padrao alvo: `Server Page -> BFF explicito -> service/adapter -> backend`
- A rota generica `src/app/api/server/[...endpoint]/route.ts` ainda existe, mas novas features de produto devem preferir BFFs nomeados por dominio

## Cobertura por dominio

| Dominio backend | UI/UX no frontend | BFF dedicado | Estado atual |
|---|---:|---:|---|
| Auth (`/api/v1/auth/**`) | Sim | Sim | Login, registro, reset, Google e convite |
| Users (`/api/v1/users/**`) | Sim | Sim | Perfil, senha, tema e gestao de roles; lista paginada normalizada no frontend |
| Companies (`/api/v1/companies/**`) | Sim | Sim | Gestao de tenants/empresas |
| Employees (`/api/v1/employees/**`) | Sim | Sim | Team/colaboradores e cadastro |
| Organization (`/api/v1/organization/**`) | Sim | Sim | Setores e projetos |
| Work posts (`/api/v1/work-posts/**`) | Sim | Sim | CRUD operacional |
| Operational capacities (`/api/v1/operational-capacities/**`) | Sim | Sim | CRUD e consulta por setor/posto |
| Escala classica (`/api/v1/escala/**`) | Sim | Sim | Calendario, admin, meus dias e usuarios escalaveis |
| Schedules (`/api/v1/schedules/**`) | Sim | Sim | Resumo do dashboard, geracao e trocas |
| Scheduling (`/api/v1/scheduling/**`) | Sim | Sim | Escala Inteligente SSR + editor operacional mensal |
| Messages (`/api/v1/messages/**`) | Parcial | Sim | Header com pendencias e modal de decisao; ainda nao ha central completa de mensagens |
| ReBAC (`/api/v1/rebac/**`) | Sim | Sim | UI administrativa e enums de apoio |
| Learning progress (`/api/v1/learning-progress/**`) | Sim | Sim | Pagina `/dashboard/aprendizado` |
| Stats (`/api/v1/stats/**`) | Sim | Sim | Summary do dashboard e metricas de marketing |
| Reports (`/api/v1/reports/**`) | Sim | Sim | Folha e export CSV via BFF |
| Billing (`/api/v1/billing/**`) | Sim | Sim | Planos, checkout, assinatura e cancelamento |
| Leads (`/api/v1/leads`) | Sim | Sim | Formularios publicos comerciais |
| Contact (`/api/v1/public/contact`) | Sim | Sim | Pagina publica de contato |
| Check-in (`/api/v1/check-in`) | Sim | Sim | Fluxo operacional do ponto web basico |
| Team invitations (`/api/v1/team/invitations/**`) | Sim | Sim | Convites internos e consulta por token |
| AI (`/api/v1/ai/**`) | Sim | Sim | Painel de IA via BFF |
| Webhooks/health (`/actuator/health`, webhooks) | Nao aplicavel | Nao | Endpoints tecnicos e de integracao externa |

## Escala Inteligente

Estado atual entregue no frontend:

- Pagina SSR em `/dashboard/escala/inteligente`
- BFFs dedicados para:
  - `GET /api/bff/scheduling/month-calendar`
  - `GET /api/bff/scheduling/legends`
  - `GET|POST /api/bff/scheduling/holidays`
  - `POST /api/bff/scheduling/cycles`
  - `GET /api/bff/scheduling/cycles/{id}`
  - `GET|PATCH /api/bff/scheduling/cycles/{id}/assignments`
  - `GET /api/bff/scheduling/cycles/{id}/counters`
  - `POST /api/bff/scheduling/cycles/{id}/validate`
  - `GET /api/bff/scheduling/cycles/{id}/alerts`
  - `POST /api/bff/scheduling/cycles/{id}/alerts/{alertId}/acknowledge`
  - `POST /api/bff/scheduling/cycles/{id}/publish`
  - `POST /api/bff/scheduling/cycles/{id}/rectify`
  - `POST /api/bff/scheduling/cycles/{id}/archive`
- Workspace cliente com:
  - grade mensal de atribuicoes
  - edicao por celula
  - preencher semana
  - copiar escala mensal entre colaboradores
  - presets `5x2`, `6x1`, `12x36`
  - dif visual antes do save bulk

## Mensageria

Cobertura atual:

- Polling e badge no header privado
- Modal de leitura e decisao para `PERMISSION_REQUEST` e `SHIFT_SWAP`
- BFF robusto para `GET /api/bff/messages`, `POST /api/bff/messages` e `PATCH /api/bff/messages/{id}/decision`

Lacuna atual:

- Ainda nao existe `/dashboard/mensagens` com inbox, enviados, filtros e composer

## Correcoes recentes refletidas na cobertura

- `StatsBackendAdapter` e `MessageBackendAdapter` passaram a lidar corretamente com SSR/browser
- `GET /api/v1/users` retorna estrutura paginada; o frontend agora normaliza `content[]`
- Erros transientes de polling de mensagens no browser deixaram de poluir o console como falso erro funcional
- O BFF do backend passou a responder `503` controlado quando o Spring Boot ainda nao esta pronto, em vez de propagar excecao crua de `fetch`

## Pendencias recomendadas

- Criar listagem de ciclos por mes/unidade para evitar depender de `cycleId` na URL da Escala Inteligente
- Entregar uma central de mensagens completa no dashboard
- Revisar se a rota generica `/api/server/**` ainda e necessaria para dominios que ja possuem BFF nomeado
