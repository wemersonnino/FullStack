# Changelog

## 2026-06-15 - PLG com captura publica de leads e pagina de demo

### Adicionado

- Endpoint publico `POST /api/v1/leads` no backend para captura de lead com consentimento explicito e metadados de campanha.
- Rota BFF publica `POST /api/bff/leads` no Next.js para repassar lead ao backend sem expor token.
- Seccao de captura de lead na home publica.
- Pagina publica de demo em `/{locale}/demo` para conversao comercial.
- Atualizacao manual do OpenAPI para incluir o grupo `Marketing`.

### Alterado

- `MarketingLead` passou a registrar origem, status comercial, consentimento, `lastLoginAt` e metadados extras de UTM.
- Google SSO agora grava os novos campos de lead quando cria workspace trial a partir de acesso PLG.

### Riscos conhecidos

- O fluxo comercial foi introduzido sem uma suite dedicada de testes de integracao ainda.
- O OpenAPI continua manual e precisa permanecer sincronizado com o novo controller de leads.
- A captura publica depende do cookie de atribuicao de campanha estar presente para completar os metadados de marketing.

## 2026-06-16 - Base segura do BFF do frontend

### Adicionado

- Rota catch-all autenticada `GET|POST|PUT|PATCH|DELETE /api/server/[...endpoint]` no Next.js.
- Proxy server-side para o backend Java usando `API_BASE_URL`.
- Injecao de `Authorization: Bearer <accessToken>` exclusivamente no Route Handler server-side.

### Alterado

- Rotas de dominio do frontend migradas para `/api/server/api/v1/...`.
- Compose e `.env.example` deixam de configurar `NEXT_PUBLIC_API_BASE_URL`.
- Adapters server-side passam a usar `ENV.API_BASE_URL`.

### Validado

- `pnpm typecheck`: sucesso.
- `pnpm build`: sucesso, com a rota `/api/server/[...endpoint]` registrada no App Router.

### Riscos conhecidos

- `.env.local` e segredos locais sao ignorados pelo Git e precisam ser limpos/rotacionados fora do commit.
- Rotas BFF legadas de auth/upload continuam em `/api/bff` por terem fluxos publicos ou multipart especificos.
- Ainda falta remover gradualmente dependencias antigas de `session.user.token` fora do novo catch-all.

## 2026-06-15 - Finalizacao da migracao Spring Boot 4 e Java 25

### Alterado

- Backend oficial validado em `Backend/java-app1/demo`.
- Spring Boot definido em `4.1.0`.
- Java definido em `25`.
- Dockerfile do backend usando `maven:3.9-eclipse-temurin-25` no build e `eclipse-temurin:25-jre` no runtime.
- Lombok fixado em `1.18.46` com annotation processor explicito.
- Spring Security ajustado para Spring Security 7.
- Swagger/OpenAPI mantido via WebJar `swagger-ui:5.32.2` e `OpenApiController` manual.

### Adicionado

- Dependencia `spring-boot-starter-actuator`.
- Health check publico em `GET /actuator/health`.
- Documentacao manual do health check no OpenAPI.
- Documento de auditoria da migracao em `docs/auditoria-backend-springboot-4-java-25.md`.

### Validado

- `mvn test`: 24 testes, 0 falhas, 0 erros.
- `mvn clean package`: build success.
- `docker compose config`: configuracao valida.
- `docker compose build backend`: imagem construida com sucesso.
- `docker compose up -d backend`: backend iniciou com PostgreSQL.
- `GET /actuator/health`: 200, status `UP`.
- `GET /swagger-ui/index.html`: 200.
- `GET /v3/api-docs`: 200.

### Riscos conhecidos

- Cobertura de testes ainda limitada para autenticacao, JPA, JWT e endpoints.
- OpenAPI manual exige manutencao sincronizada com controllers.
- `jjwt-jackson:0.11.5` ainda deve ser revisado em relacao a Java 25/Jackson 3.
- Saida de `docker compose config` expande segredos; nao publicar logs completos dessa saida.
