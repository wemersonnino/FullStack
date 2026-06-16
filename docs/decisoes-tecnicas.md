# Decisoes Tecnicas

## 2026-06-15 - Fechamento da migracao Spring Boot 4 e Java 25

### Contexto

A branch `feature/backend-upgrade-springboot-4-java-25` foi revalidada tecnicamente antes de commit/publicacao. O backend oficial permanece em `Backend/java-app1/demo`; o caminho `backend/java` citado em prompts anteriores nao existe neste monorepo.

### Decisoes confirmadas

- Spring Boot mantido em `4.1.0`.
- Java mantido em `25`, com compilacao Maven usando `release 25`.
- Dockerfile mantido com build `maven:3.9-eclipse-temurin-25` e runtime `eclipse-temurin:25-jre`.
- Springdoc nao foi reintroduzido por incompatibilidade ja observada com Spring Boot 4/Spring Framework 7.
- Swagger/OpenAPI permanece manual via `org.webjars:swagger-ui:5.32.2` e `OpenApiController`.
- Foi adicionado `spring-boot-starter-actuator` para expor health check operacional.
- Apenas `/actuator/health`, Swagger UI, OpenAPI e rotas publicas de autenticacao ficam liberados sem JWT.

### Validacao executada

Comandos executados na branch:

```bash
git status
git branch --show-current
git log --oneline -5
git diff --stat
java -version
mvn -v
mvn test
mvn clean package
docker compose config
docker compose build backend
docker compose up -d backend
docker compose logs --tail=120 backend
curl -i http://localhost:8080/actuator/health
curl -I http://localhost:8080/swagger-ui/index.html
curl -I http://localhost:8080/v3/api-docs
```

Resultados:

- Java local: Temurin `25.0.3 LTS`.
- Maven local: `3.8.7`.
- `mvn test`: `24` testes, `0` falhas, `0` erros.
- `mvn clean package`: `BUILD SUCCESS`, `24` testes, `0` falhas, `0` erros.
- `docker compose config`: configuracao valida.
- `docker compose build backend`: imagem `escala-backend:latest` construida com sucesso.
- `docker compose up -d backend`: `escala-postgres` running e `escala-backend` started.
- Logs: Spring Boot `4.1.0`, Java `25.0.3`, Tomcat `11.0.22`, Hibernate ORM `7.4.1.Final`, PostgreSQL JDBC conectado em `postgres:5432/escala_core`.
- Health: `GET /actuator/health` retornou `200` com `{"groups":["liveness","readiness"],"status":"UP"}`.
- Swagger UI: `GET /swagger-ui/index.html` retornou `200`.
- OpenAPI JSON: `GET /v3/api-docs` retornou `200`.

### Riscos pendentes

- A suite automatizada ainda cobre principalmente dominio de escala; faltam testes de integracao para autenticacao, JPA, JWT, serializacao Jackson 3 e endpoints REST.
- `jjwt-jackson:0.11.5` ainda puxa Jackson 2 em runtime; revisar upgrade do JJWT em uma proxima frente.
- `OpenApiController` manual precisa ser atualizado sempre que endpoints REST forem alterados.
- `docker compose config` expande segredos e variaveis sensiveis de arquivos `.env`; evitar registrar essa saida integral em artefatos compartilhados e revisar gestao de secrets.
- O Compose ainda define variaveis frontend `NEXT_PUBLIC_API_BASE_URL` e `NEXT_INTERNAL_API_BASE_URL`; a frente futura de BFF deve migrar para `API_BASE_URL` server-side e client com `baseURL: "/api/server"`.

### Decisao

A migracao Spring Boot 4.1.0 + Java 25 esta tecnicamente validada na branch `feature/backend-upgrade-springboot-4-java-25` para seguir para commit, publicacao remota e PR para `develop`, desde que o PR deixe claros os riscos de cobertura e escopo.

## 2026-06-14 - Avaliacao Spring Boot 4.1.0 e Java 25

### Contexto

Foi avaliada a migracao do backend oficial em `Backend/java-app1/demo` para Spring Boot 4.1.0 e Java 25, mantendo Maven e linguagem Java.

Branch de teste criada:

```text
feature/backend-upgrade-springboot-4-java-25
```

### Versoes identificadas

Estado original do backend:

- Spring Boot: 3.5.14.
- Java configurado no `pom.xml`: 21.
- Maven local: 3.8.7.
- Java local: 21.0.11.
- Docker backend: `maven:3.9.11-eclipse-temurin-21-alpine` e `eclipse-temurin:21-jre-alpine`.
- Dependencias principais: Spring Data JPA, Spring Security, Spring Web, PostgreSQL Driver, Lombok, JJWT 0.11.5, Springdoc OpenAPI 2.8.17.

Estado testado na branch:

- Spring Boot: 4.1.0.
- Java: 25.
- Docker backend: `maven:3.9-eclipse-temurin-25` e `eclipse-temurin:25-jre`.
- Lombok: 1.18.46 com annotation processor explicito.
- Jackson usado pelo codigo da aplicacao: pacote `tools.jackson.databind` via Spring Boot 4/Jackson 3.

Referencias oficiais usadas:

- Spring Boot 4.1.0 System Requirements: `https://docs.spring.io/spring-boot/system-requirements.html`.
- Spring Boot 4.1.0 Managed Dependency Coordinates: `https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html`.

### Compatibilidade

Spring Boot 4.1.0 e oficialmente compativel com Java ate Java 26 e exige Spring Framework 7.0.8 ou superior. Tambem exige Maven 3.6.3 ou superior, portanto o Maven local 3.8.7 atende ao requisito, mas a maquina local com JDK 21 nao consegue compilar `--release 25`.

Componentes observados na resolucao do build:

- Spring Framework: 7.0.8.
- Spring Security: 7.1.0.
- Spring Data JPA: 4.1.0.
- Hibernate ORM: 7.4.1.Final.
- Tomcat embarcado: 11.0.22, Servlet 6.1.
- PostgreSQL JDBC: 42.7.11.
- JUnit: 6.0.3 no BOM do Boot 4.
- Jackson principal do Boot 4: Jackson 3 em `tools.jackson.*`.

### Quebras encontradas e ajustes

1. O build local com JDK 21 falhou com `release version 25 not supported`.
   - Decisao: validar Java 25 via Docker ate a maquina local ter JDK 25 instalado.

2. Lombok nao gerava metodos durante a primeira tentativa de build Java 25.
   - Ajuste: definir `lombok.version` 1.18.46 e configurar `maven-compiler-plugin` com `annotationProcessorPaths`.

3. Spring Security 7 removeu o fluxo antigo de `DaoAuthenticationProvider` sem `UserDetailsService` no construtor.
   - Ajuste: instanciar `DaoAuthenticationProvider(userDetailsService())`.

4. `springdoc-openapi-starter-webmvc-ui:2.8.17` quebrou em runtime com `ClassNotFoundException: org.springframework.boot.autoconfigure.web.servlet.WebMvcProperties`.
   - Decisao: remover Springdoc desta branch para permitir a aplicacao subir.
   - Solucao adotada: usar `org.webjars:swagger-ui:5.32.2` e `OpenApiController` manual para servir Swagger UI e `/v3/api-docs`.

5. Remover Springdoc expôs imports antigos de Jackson 2 em dois services.
   - Ajuste: migrar `GoogleIdentityService` e `RecaptchaService` para `tools.jackson.databind.JsonNode` e `tools.jackson.databind.ObjectMapper`.

### Resultado dos comandos

Comandos relevantes executados:

```bash
git checkout -b feature/backend-upgrade-springboot-4-java-25
mvn test
docker build -t escala-backend:latest Backend/java-app1/demo
docker run --rm -v /home/nino/Projects/Backend/java-app1/demo:/workspace -v /tmp/escala-m2:/root/.m2 -w /workspace maven:3.9-eclipse-temurin-25 mvn test
docker compose up -d --build backend
docker compose ps backend
docker run --rm --network escala-network curlimages/curl:8.17.0 -i http://backend:8080/api/v1/auth/authenticate
docker compose up -d --build --force-recreate backend
curl -sS -o /tmp/swagger-host.html -w "%{http_code}" http://localhost:8080/swagger-ui/index.html
curl -sS -o /tmp/api-docs.json -w "%{http_code}" http://localhost:8080/v3/api-docs
```

Resultados:

- Depois da instalacao do JDK 25, `mvn test` local passou: 24 testes, 0 falhas, 0 erros.
- `docker run ... mvn test` passou: 24 testes, 0 falhas, 0 erros.
- `docker compose up -d --build backend` construiu a imagem e iniciou o container.
- `docker compose ps backend` mostrou o container `Up`.
- Chamada HTTP interna de autenticacao com `POST /api/v1/auth/authenticate` retornou `200`.
- `http://localhost:8080/swagger-ui/index.html` retornou `200`.
- `http://localhost:8080/v3/api-docs` retornou `200`.
- Logs finais do backend nao mostram SQL bruto `Hibernate:` com `spring.jpa.show-sql` desligado.

### Decisao

A migracao para Spring Boot 4.1.0 e Java 25 e tecnicamente viavel na branch de teste: o backend compila localmente com JDK 25, compila em Docker com JDK 25, a suite de dominio passa, a imagem Docker e construida, o servico sobe no Compose, autenticacao responde e Swagger/OpenAPI esta disponivel.

Ainda nao e seguro fazer merge em `develop` como decisao final de produto. Motivos:

- A documentacao OpenAPI/Swagger foi recuperada com implementacao manual; ainda nao ha geracao automatica de schemas enquanto Springdoc 2.8.17 permanecer incompativel com Spring Boot 4.
- A cobertura automatizada atual e pequena para o tamanho do backend: 24 testes, concentrados no dominio de escala.
- Ainda nao ha teste de integracao cobrindo autenticacao, JPA, filtros JWT, serializacao Jackson 3 e endpoints protegidos.
- JJWT 0.11.5 ainda deve ser revisado contra Java 25/Jackson 3, pois traz `jjwt-jackson` com Jackson 2 em runtime.
- A arquitetura esta em evolucao para hexagonal: o modulo de dominio de escala ja tem testes e regras isoladas, mas ainda existem controllers e services com responsabilidades de aplicacao misturadas. Esta migracao evitou reorganizacao ampla para reduzir risco comportamental.

Decisao operacional:

- Manter a branch `feature/backend-upgrade-springboot-4-java-25` para validacao.
- Nao mesclar em `develop` ate revisar a estrategia OpenAPI manual versus geracao automatica, ampliar testes de integracao e revisar JJWT.
- Para builds locais, instalar JDK 25 ou usar Docker como ambiente oficial de validacao.

### Como testar

```bash
docker run --rm -v /home/nino/Projects/Backend/java-app1/demo:/workspace -v /tmp/escala-m2:/root/.m2 -w /workspace maven:3.9-eclipse-temurin-25 mvn test
docker compose up -d --build backend
docker compose ps backend
docker run --rm --network escala-network curlimages/curl:8.17.0 -i http://backend:8080/api/v1/auth/authenticate
curl -i http://localhost:8080/swagger-ui/index.html
curl -i http://localhost:8080/v3/api-docs
```

Resultado esperado:

- Maven: `BUILD SUCCESS`, `Tests run: 24, Failures: 0, Errors: 0`.
- Compose: `escala-backend` em estado `Up`.
- Autenticacao interna com metodo `POST`: HTTP `200` para credenciais validas.
- Swagger UI: HTTP `200`.
- OpenAPI JSON: HTTP `200`.

### Proximos passos

- Manter `OpenApiController` sincronizado com os controllers reais enquanto Springdoc nao for compativel com Spring Boot 4.
- Criar testes de integracao para autenticação, filtros JWT, repositories JPA e endpoints principais.
- Revisar JJWT e avaliar upgrade para versao mais recente antes do merge.
- Manter `spring.jpa.show-sql: false` em `development`; ativar SQL bruto somente em depuracao pontual.
- Continuar a migracao arquitetural por contexto, movendo regras para `domain`/`application` e deixando controllers apenas como adaptadores HTTP.

## 2026-06-14 - Swagger/OpenAPI compativel com Spring Boot 4

### Contexto

O acesso a `http://localhost:8080/swagger-ui/index.html` deixou de funcionar depois da remocao do Springdoc durante a migracao. A tentativa de restaurar `springdoc-openapi-starter-webmvc-ui:2.8.17` compilou, mas derrubou o backend em runtime.

Erro observado nos logs:

```text
java.lang.NoClassDefFoundError: org/springframework/boot/autoconfigure/web/servlet/WebMvcProperties
```

### Decisao

Enquanto nao houver Springdoc compativel com Spring Boot 4/Spring Framework 7 no projeto, a documentacao sera servida manualmente:

- Dependencia: `org.webjars:swagger-ui:5.32.2`.
- UI: `GET /swagger-ui/index.html` e `GET /swagger-ui.html`.
- JSON: `GET /v3/api-docs`.
- Implementacao: `Backend/java-app1/demo/src/main/java/com/escala/authservice/controller/OpenApiController.java`.
- Rotas liberadas no Spring Security: `/swagger-ui.html`, `/swagger-ui/**`, `/v3/api-docs/**`, `/webjars/**`.

### Escopo documentado

O `OpenApiController` documenta os controllers reais atualmente expostos:

- `AuthenticationController`: cadastro, login, recuperacao/reset de senha, completar cadastro e Google SSO.
- `UserManagementController`: usuario atual, senha, roles, tema e listagem.
- `CompanyController`: CRUD de empresas.
- `EmployeeController`: CRUD de funcionarios.
- `OrganizationController`: setores e projetos.
- `EscalaController`: calendario operacional, filtros administrativos e usuarios escalaveis.
- `ScheduleController`: escala mensal, geracao, trocas, aprovacao de colega, decisao final e dashboard.
- `CheckInController`: registro de ponto.
- `ReportController`: relatorio de folha e exportacao CSV.
- `TeamInvitationController`: convites por empresa e token publico.

Foram validados `37` paths e `10` grupos no JSON OpenAPI.

### Validacao

```bash
mvn test
docker compose up -d --build --force-recreate backend
curl -sS -o /tmp/swagger-host.html -w "%{http_code}" http://localhost:8080/swagger-ui/index.html
curl -sS -o /tmp/api-docs.json -w "%{http_code}" http://localhost:8080/v3/api-docs
jq '.tags | length' /tmp/api-docs.json
jq '.paths | keys | length' /tmp/api-docs.json
```

Resultados:

- Testes: `24` executados, `0` falhas, `0` erros.
- Swagger UI: `200`.
- OpenAPI JSON: `200`.
- Tags: `10`.
- Paths: `37`.

### Restricoes

- Os schemas de request/response ainda sao descritivos e nao gerados automaticamente a partir dos DTOs.
- Ao alterar endpoints, e necessario atualizar manualmente o `OpenApiController`.
- Quando surgir versao do Springdoc compativel com Spring Boot 4, reavaliar substituir a documentacao manual por geracao automatica.
