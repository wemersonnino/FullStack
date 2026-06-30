# Gestao Inteligente de Escalas

Monorepo do produto Escala, com frontend Next.js, backend Spring Boot, CMS Strapi e infraestrutura local em Docker Compose.

## Componentes oficiais

- Frontend principal: `Frontend/web-app3/escala`
- Frontend legado/futuro: `Frontend/web-app1/app`
- Backend oficial: `Backend/java-app1/demo`
- CMS editorial: `Backend/cms-strapi`
- Banco e compose local: `Data/postgres` e `docker-compose.yml`
- Documentacao conceitual e operacional: `docs/`

## Estado atual validado

- Frontend: Next.js `16.2.6`, React `19.2.6`, TypeScript `5.9.3`, pnpm `10.33.3`
- Backend: Spring Boot `4.1.0`, Java `25`, Maven
- Banco: PostgreSQL em Docker, com segregacao para backend e Strapi
- Swagger local: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON local: `http://localhost:8080/v3/api-docs`
- Dashboard privado com BFF em `src/app/api/bff/**`
- Escala Inteligente disponivel em `/dashboard/escala/inteligente`

## URLs locais

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Strapi: `http://localhost:1337`
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`

## Subir o ambiente local

```bash
docker compose up -d --build
```

O compose atual usa `healthcheck` e `depends_on.condition: service_healthy` para reduzir erros de startup entre `postgres`, `backend`, `strapi` e `frontend`.

## Comandos principais

### Frontend

```bash
cd Frontend/web-app3/escala
pnpm run dev
pnpm run typecheck
pnpm run build
```

### Backend

```bash
cd Backend/java-app1/demo
./mvnw test
./mvnw clean package
```

## Destaques de produto implementados

- BFF explicito por dominio para auth, users, companies, employees, organization, escala, schedules, scheduling, reports, billing, messages, AI, ReBAC e stats
- Dashboard privado com rotas SSR e componentes cliente para mutacoes
- Escala Inteligente com:
  - calendario mensal SSR
  - feriados e legendas
  - ciclo mensal com validacao, publicacao, retificacao e arquivamento
  - editor operacional de atribuicoes em grade mensal
  - operacoes de produtividade: preencher semana, copiar mes, presets `5x2`/`6x1`/`12x36` e dif visual antes do PATCH bulk
- Mensageria in-app parcial via dropdown no header e modal de decisao
- Hardening de sessao do perfil para evitar update excessivo de dados no `next-auth`

## Documentacao principal

- [docs/decisoes-tecnicas.md](docs/decisoes-tecnicas.md)
- [docs/frontend-backend-route-coverage.md](docs/frontend-backend-route-coverage.md)
- [docs/api/swagger-openapi.md](docs/api/swagger-openapi.md)
- [docs/ambientes.md](docs/ambientes.md)
- [docs/plano-implementacao-gestao-mensal-inteligente-escalas.md](docs/plano-implementacao-gestao-mensal-inteligente-escalas.md)
- [docs/Arquitetura/Arquitetura.md](docs/Arquitetura/Arquitetura.md)
- [docs/changelog.md](docs/changelog.md)

## Observacoes arquiteturais

- O frontend nunca acessa banco diretamente.
- O backend Spring Boot e a fonte da verdade para autenticacao, negocio e persistencia transacional.
- O Strapi permanece restrito a conteudo editorial, SEO, menus, campanhas e formularios.
- O BFF do Next.js mascara URLs internas e agrega dados quando faz sentido para SSR e UX.
