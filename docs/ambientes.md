# Documentacao de Ambientes

Data: 2026-06-30

## Ambiente local oficial

O ambiente local oficial roda pelo `docker-compose.yml` na raiz do monorepo.

### Servicos expostos

- Frontend Next.js: `http://localhost:3000`
- Backend Spring Boot: `http://localhost:8080`
- Strapi CMS: `http://localhost:1337`
- PostgreSQL: `localhost:5432`

### Topologia interna do Compose

- `frontend` consome o backend por `http://backend:8080`
- `frontend` consome o Strapi internamente por `http://strapi:1337`
- `strapi` e `backend` compartilham o `postgres`, mas com bancos/usuarios separados
- Todos os servicos usam a rede `escala-network`

### Ordem de subida e healthchecks

O compose atual usa `healthcheck` e `depends_on.condition: service_healthy` para reduzir corridas de startup:

- `postgres`: `pg_isready`
- `backend`: `GET /actuator/health`
- `strapi`: `GET /admin`
- `frontend`: `GET /api/auth/session`

Isso foi introduzido porque o frontend estava tentando chamar o backend e o Strapi antes de ambos ficarem prontos, gerando `ECONNREFUSED` e erros falsos em SSR/BFF.

## Variaveis locais mais sensiveis

### Frontend

- `API_BASE_URL=http://backend:8080`
- `NEXT_INTERNAL_STRAPI_URL=http://strapi:1337`
- `NEXT_PUBLIC_STRAPI_PUBLIC_URL=http://localhost:1337`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET=...`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` quando Google SSO estiver ativo

### Backend

- `.env` montado em `Backend/java-app1/demo/.env`
- credenciais JWT e integracoes externas ficam fora da imagem
- o backend expoe `GET /actuator/health` para readiness local

### Strapi

- `.env` proprio em `Backend/cms-strapi/.env`
- `DATABASE_*` apontando para o `postgres`
- `STRAPI_CRON_ENABLED`, `STRAPI_AUTO_SEED_MARKETING` e `STRAPI_FORCE_MARKETING_SEED` governam bootstrap editorial

## Ambiente de homologacao

Objetivo:

- testes integrados
- smoke tests de deploy
- validacao de auth, BFF, backend, CMS e billing

Diretrizes:

- bases mascaradas ou controladas
- segredos vindos do provedor e nunca commitados
- Swagger nao deve ficar publico sem restricao fora do ambiente local
- logs e tracing habilitados

## Ambiente de producao

Diretrizes minimas:

- TLS fim a fim
- segredos em secret manager
- frontend, backend e Strapi em rede privada quando possivel
- banco com backup automatizado e restore testado
- headers de seguranca no frontend
- observabilidade de aplicacao e infraestrutura

## Subdominios esperados para producao

- `www.*`: site publico e landing pages
- `app.*`: aplicacao principal
- `api.*`: backend Spring Boot
- `cms.*`: painel/editorial do Strapi
- `assets.*`: CDN/arquivos publicos

## Regras operacionais

- O frontend nunca deve apontar para `localhost:8080` quando estiver dentro de container; deve usar o hostname do servico Docker
- O BFF do Next.js deve ser a porta de entrada do browser para fluxos autenticados
- O Strapi permanece como fonte editorial; dados transacionais seguem no backend Java
