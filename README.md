# Escala

SaaS para gestao mensal inteligente de escalas, com publicacao auditavel, regras operacionais, trocas, ponto web, conteudo editorial e isolamento multi-tenant.

## Arquitetura oficial

- Frontend: `Frontend/web-app3/escala` — Next.js 16, React 19 e TypeScript.
- Backend: `Backend/java-app1/demo` — Spring Boot 4.1, Java 25 e Maven.
- CMS: `Backend/cms-strapi` — Strapi 5 restrito a conteudo, SEO, menus e URLs editoriais.
- Dados: PostgreSQL 16, com banco/usuario separados para Spring Boot e Strapi.
- Estado efemero: Redis para locks e rate limit.

O frontend nao acessa o banco diretamente. Fluxos operacionais passam pelo Spring Boot/BFF; o Strapi nao autentica usuarios finais nem armazena regras de escala, auditoria operacional ou turnos.

## Executar com Docker

Pre-requisitos: Git, Docker Desktop/Engine e Docker Compose v2.

```bash
git clone https://github.com/DesignArtWorks/FullStack.git
cd FullStack
cp .env.compose.example .env
```

Substitua todos os placeholders `change-me`/`replace-with` do `.env` por valores locais fortes. O arquivo `.env` e ignorado pelo Git.

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
```

Servicos:

- Frontend: http://localhost:3000
- Spring Boot: http://localhost:8080
- Health do backend: http://localhost:8080/actuator/health
- Swagger local: http://localhost:8080/swagger-ui/index.html
- Strapi: http://localhost:1337/admin
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Comandos por componente

Backend:

```bash
cd Backend/java-app1/demo
./mvnw test
./mvnw -Pintegration test
```

Frontend:

```bash
cd Frontend/web-app3/escala
corepack pnpm install --frozen-lockfile
pnpm run lint
pnpm run typecheck
pnpm run build
```

CMS:

```bash
cd Backend/cms-strapi
npm ci
npm run build
```

## Documentacao

- [Ambientes](docs/ambientes.md)
- [Arquitetura](docs/Arquitetura/Arquitetura.md)
- [DevOps](docs/Arquitetura/Arquitetura-Devops.md)
- [Gate de CI](docs/ci-gates.md)
- [Roadmap](docs/roadmap.md)
- [OKRs](docs/okr.md)

## Seguranca

- Nunca versionar `.env`, senhas, tokens, dumps ou chaves privadas.
- Somente `/actuator/health` e publico; demais endpoints do Actuator devem permanecer protegidos.
- Dados de tenant devem ser derivados do usuario autenticado, nunca confiados diretamente ao frontend.
- Incidentes e suspeitas de vazamento devem resultar em rotacao imediata dos segredos afetados.
