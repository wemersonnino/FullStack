# Documentacao de Ambientes

Data: 2026-06-30

## Ambiente local oficial

O ambiente local oficial roda pelo `docker-compose.yml` na raiz do monorepo.

Antes da primeira subida, copie `.env.compose.example` para `.env` na raiz e substitua todos os placeholders. Os antigos `.env` versionados por componente nao sao fonte de configuracao do Compose.

### Servicos expostos

- Frontend Next.js: `http://localhost:3000`
- Backend Spring Boot: `http://localhost:8080`
- Strapi CMS: `http://localhost:1337`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`

### Topologia interna do Compose

- `frontend` consome o backend por `http://backend:8080`
- `frontend` consome o Strapi internamente por `http://strapi:1337`
- `frontend` consome Redis internamente por `redis://redis:6379` para rate limit e estado efemero de borda
- `backend` consome Redis por `REDIS_HOST`/`REDIS_PORT` para locks curtos e expansao de cache
- `strapi` e `backend` compartilham o `postgres`, mas com bancos/usuarios separados
- Todos os servicos usam a rede `escala-network`

### Ordem de subida e healthchecks

O compose atual usa `healthcheck` e `depends_on.condition: service_healthy` para reduzir corridas de startup:

- `postgres`: `pg_isready`
- `backend`: `GET /actuator/health`
- `strapi`: `GET /admin`
- `frontend`: `GET /api/auth/session`
- `redis`: `redis-cli ping`

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

- variaveis sao injetadas pelo Compose a partir do `.env` ignorado na raiz
- `Backend/java-app1/demo/.env.example` documenta execucao isolada do componente
- `application.yml` nao deve mais conter fallback versionado para `JWT_SECRET`, `STRAPI_BASE_URL`, banco ou Redis
- credenciais JWT e integracoes externas ficam fora da imagem
- o backend expoe `GET /actuator/health` para readiness local
- `SPRING_PROFILES_ACTIVE=development` e o profile que preserva `ddl-auto=update`; fora dele a regra padrao e `validate` + Flyway

### Redis

- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- opcionalmente `REDIS_PASSWORD`
- uso atual:
  - lock distribuido para geracao/publicacao de escala
  - rate limit no BFF do frontend
  - base para evolucao de cache curto e idempotencia

### Strapi

- variaveis sao injetadas pelo Compose a partir do `.env` ignorado na raiz
- `Backend/cms-strapi/.env.example` documenta execucao isolada do componente
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
- `JWT_SECRET`, `DB_PASS`, `REDIS_PASSWORD`, `STRAPI_BASE_URL`, Stripe, Google e Recaptcha devem vir de secret manager ou variaveis injetadas pelo ambiente
- Swagger nao deve ficar publico sem restricao fora do ambiente local
- logs e tracing habilitados
- A decisao normativa de armazenamento, IAM, KMS, rotacao e recuperacao esta em [ADR-005](adr-005-secrets-producao-aws.md). Homologacao usa cofre e roles proprios, nunca valores ou referencias de producao.

## Ambiente de producao

Diretrizes minimas:

- TLS fim a fim
- segredos em secret manager
- frontend, backend e Strapi em rede privada quando possivel
- Redis privado, sem exposicao publica e com auth/TLS quando o provedor suportar
- Em producao, portas expostas pelo Compose local nao sao permitidas: a matriz de rotas publicas, servicos internos e administracao esta na [ADR-007](adr-007-exposicao-servicos-producao.md).
- O contrato de autenticacao entre browser, NextAuth/BFF e Spring (cookies, Bearer, CORS, CSRF, logout e ausencia atual de refresh) esta na [ADR-008](adr-008-autenticacao-bff-nextauth-spring.md).
- banco com backup automatizado e restore testado
- headers de seguranca no frontend
- observabilidade de aplicacao e infraestrutura
- Secrets Manager e o mecanismo padrao para chaves e credenciais; SSM Parameter Store `SecureString` + KMS fica restrito a configuracoes sensiveis estaveis justificadas. Consulte [ADR-005](adr-005-secrets-producao-aws.md).

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
- O `.env` local do backend pode existir em desenvolvimento, mas o valor real de `JWT_SECRET` deve ser rotacionado e retirado do Git antes de homolog/producao
- Nenhuma aplicacao Strapi deve existir diretamente em `Backend/`; o unico CMS suportado e `Backend/cms-strapi`
