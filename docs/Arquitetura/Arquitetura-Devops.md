# Arquitetura DevOps

Data: 2026-06-30

## Topologia local oficial

O ambiente local oficial usa o `docker-compose.yml` da raiz e sobe quatro servicos principais:

- `postgres`
- `backend`
- `strapi`
- `frontend`

## Compose atual

### postgres

- imagem local: `escala-postgres:16-alpine`
- origem: `Data/postgres/Docker/develop/Dockerfile`
- volume: `escala_pg_data`
- script de init montado como somente leitura
- `healthcheck` com `pg_isready`

### backend

- imagem local: `escala-backend:develop`
- origem: `Backend/java-app1/demo/Docker/develop/Dockerfile`
- depende de `postgres` saudavel
- `healthcheck` em `GET /actuator/health`
- `.env` montado como arquivo externo

### strapi

- imagem local: `cms-strapi:develop`
- origem: `Backend/cms-strapi/Docker/develop/Dockerfile`
- depende de `postgres` saudavel
- `healthcheck` em `GET /admin`
- volumes montados para `config`, `src`, `scripts`, `data` e uploads

### frontend

- imagem local: `fullstack-frontend:develop`
- origem: `Frontend/web-app3/escala/Docker/develop/Dockerfile`
- depende de `backend` e `strapi` saudaveis
- `healthcheck` em `GET /api/auth/session`
- usa `API_BASE_URL=http://backend:8080`
- usa `NEXT_INTERNAL_STRAPI_URL=http://strapi:1337`

## Motivo dos healthchecks

Os healthchecks e `depends_on.condition: service_healthy` passaram a ser obrigatorios no compose local porque o frontend estava iniciando antes do backend e do Strapi terminarem o boot, gerando:

- `ECONNREFUSED` no proxy do BFF
- `500` falsos em SSR
- ruido de diagnostico em dashboard e notificacoes

## Build e runtime

### Backend

- build com Maven e Java 25
- runtime com `eclipse-temurin:25-jre`
- Swagger manual e actuator disponiveis localmente

### Frontend

- dev local via `pnpm dev`
- typecheck validado com `pnpm run typecheck`
- build validado com `pnpm run build` quando necessario

### Strapi

- papel editorial restrito
- nao e fonte da verdade para usuarios finais ou negocio transacional

## Variaveis criticas

### Frontend

- `API_BASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_INTERNAL_STRAPI_URL`
- `NEXT_PUBLIC_STRAPI_PUBLIC_URL`

### Backend

- JWT secret
- credenciais do PostgreSQL
- configuracoes de Stripe/Google quando habilitadas

### Strapi

- `DATABASE_*`
- chaves do admin/JWT do Strapi
- variaveis de bootstrap editorial

## Regras operacionais

- nao usar `localhost:8080` dentro do container frontend; usar `backend:8080`
- nao acoplar o browser diretamente ao Spring Boot para fluxos autenticados
- segredos devem entrar por `.env`, `env_file` ou secret manager, nunca hardcoded no codigo
- mudancas de REST no backend exigem revisao do BFF e do `OpenApiController`

## Validacoes minimas apos mudancas estruturais

```bash
docker compose config
docker compose up -d --build
docker compose ps
curl -I http://localhost:3000/api/auth/session
curl -I http://localhost:8080/actuator/health
curl -I http://localhost:8080/swagger-ui/index.html
curl -I http://localhost:1337/admin
```

## Producao e homologacao

Diretrizes minimas:

- TLS
- rede privada entre servicos quando possivel
- banco com backup e restore testados
- observabilidade
- segredos fora do repositorio
- Swagger protegido fora do ambiente local
