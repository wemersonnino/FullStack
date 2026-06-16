# Auditoria Backend Spring Boot 4 e Java 25

## Atualizacao complementar

Branch atual continua sendo `feature/backend-upgrade-springboot-4-java-25` no historico da auditoria original, mas a arvore de trabalho desta sessao tambem recebeu a frente publica de PLG com captura de leads e pagina de demo.

Essa adicao nao invalida a validacao estrutural da migracao Spring Boot 4 / Java 25, mas introduz um novo controller e rotas publicas que ainda precisam ser cobertos por testes especificos antes de qualquer merge final.

## Resumo

Branch auditada: `feature/backend-upgrade-springboot-4-java-25`.

Backend oficial auditado: `Backend/java-app1/demo`.

Objetivo: validar a migracao do backend para Spring Boot 4.1.0 e Java 25 antes de commit, push e abertura de PR para `develop`.

## Estado Git

- Branch atual confirmada: `feature/backend-upgrade-springboot-4-java-25`.
- A arvore de trabalho possui alteracoes alem da migracao pura, incluindo Strapi, frontend, docs e novas classes de produto.
- Essas alteracoes nao foram revertidas, pois podem ser trabalho existente do usuario.
- Recomendacao: revisar o escopo do commit/PR antes de publicar, para evitar misturar migracao de runtime com features comerciais ou CMS.

## Arquivos tecnicos revisados

- `Backend/java-app1/demo/pom.xml`
- `Backend/java-app1/demo/Dockerfile`
- `Backend/java-app1/demo/src/main/resources/application.yml`
- `Backend/java-app1/demo/src/main/java/com/escala/authservice/config/ApplicationConfig.java`
- `Backend/java-app1/demo/src/main/java/com/escala/authservice/config/SecurityConfiguration.java`
- `Backend/java-app1/demo/src/main/java/com/escala/authservice/controller/OpenApiController.java`
- `docker-compose.yml`
- `docs/decisoes-tecnicas.md`
- `docs/changelog.md`

## Versoes validadas

- Java local: Temurin `25.0.3 LTS`.
- Maven local: `3.8.7`.
- Spring Boot: `4.1.0`.
- Spring Framework observado no build/runtime: `7.0.8`.
- Spring Security observado: `7.1.0`.
- Hibernate ORM observado: `7.4.1.Final`.
- Tomcat observado: `11.0.22`.
- PostgreSQL JDBC observado: `42.7.11`.
- Docker build: `maven:3.9-eclipse-temurin-25`.
- Docker runtime: `eclipse-temurin:25-jre`.
- Swagger UI: `org.webjars:swagger-ui:5.32.2`.

## Comandos executados

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

## Resultado dos comandos

- `java -version`: Temurin `25.0.3 LTS`.
- `mvn -v`: Maven `3.8.7` usando Java `25.0.3`.
- `mvn test`: `BUILD SUCCESS`, 24 testes, 0 falhas, 0 erros.
- `mvn clean package`: `BUILD SUCCESS`, 24 testes, 0 falhas, 0 erros.
- `docker compose config`: configuracao valida.
- `docker compose build backend`: imagem `escala-backend:latest` construida com sucesso.
- `docker compose up -d backend`: `escala-postgres` running e `escala-backend` started.
- `docker compose logs --tail=120 backend`: aplicacao iniciou com Spring Boot `4.1.0`, Java `25.0.3`, Tomcat `11.0.22`, JPA/Hibernate inicializado e conexao PostgreSQL estabelecida.
- `curl -i http://localhost:8080/actuator/health`: `HTTP/1.1 200`, status `UP`.
- `curl -I http://localhost:8080/swagger-ui/index.html`: `HTTP/1.1 200`.
- `curl -I http://localhost:8080/v3/api-docs`: `HTTP/1.1 200`.

## Erros encontrados

### Maven no sandbox

Comando executado:

```bash
mvn clean package
```

Erro:

```text
Failed to create parent directories for tracking file /home/nino/.m2/...
```

Causa provavel: o sandbox nao permite gravar novas dependencias em `~/.m2`.

Tentativa realizada: executar Maven fora do sandbox com permissao escalada.

Impacto: ambiental, nao indica falha do codigo.

Resultado: `mvn test` e `mvn clean package` passaram fora do sandbox.

### Docker Buildx no sandbox

Comando executado:

```bash
docker compose build backend
```

Erro:

```text
failed to update builder last activity time: open /home/nino/.docker/buildx/activity/...: read-only file system
```

Causa provavel: Docker Buildx precisa gravar metadados em `~/.docker`.

Tentativa realizada: executar Docker fora do sandbox com permissao escalada.

Impacto: ambiental, nao indica falha do Dockerfile.

Resultado: imagem `escala-backend:latest` construida com sucesso.

### Health check inicialmente protegido

Comando executado:

```bash
curl -i http://localhost:8080/actuator/health
```

Erro: `HTTP/1.1 403`.

Causa provavel: Actuator nao estava configurado e a seguranca bloqueava `/actuator/health`.

Correcao aplicada:

- Adicionado `spring-boot-starter-actuator`.
- Liberado apenas `/actuator/health` no `SecurityConfiguration`.
- Documentado `/actuator/health` no `OpenApiController`.

Resultado: `HTTP/1.1 200`, status `UP`.

## Correcoes aplicadas nesta auditoria

- `pom.xml`: adicionado `spring-boot-starter-actuator`.
- `SecurityConfiguration.java`: liberado `GET /actuator/health` sem JWT.
- `OpenApiController.java`: adicionada tag `Operacional` e path `/actuator/health`.
- `docs/decisoes-tecnicas.md`: registrada decisao final da migracao.
- `docs/changelog.md`: criado changelog da migracao.
- `docs/auditoria-backend-springboot-4-java-25.md`: criada auditoria final.

## Evidencia esperada

```text
Maven: BUILD SUCCESS
Testes: Tests run: 24, Failures: 0, Errors: 0, Skipped: 0
Docker: Image escala-backend:latest Built
Backend: Started AuthServiceApplication
Health: HTTP/1.1 200 {"groups":["liveness","readiness"],"status":"UP"}
Swagger: HTTP/1.1 200
OpenAPI: HTTP/1.1 200
```

## Riscos pendentes

- Cobertura de testes insuficiente para autenticacao, JPA, JWT, filtros de seguranca e endpoints protegidos.
- OpenAPI manual depende de atualizacao disciplinada sempre que controllers mudarem.
- `jjwt-jackson:0.11.5` deve ser revisado contra Java 25/Jackson 3.
- `docker compose config` expande segredos e variaveis sensiveis; nao publicar saida integral.
- Existem alteracoes de Strapi e frontend na mesma branch; revisar se devem entrar no mesmo PR da migracao.
- Ainda nao foi feito merge em `develop` ou `main`.

## Recomendacao

A migracao do backend esta tecnicamente validada para commit e PR para `develop`. Antes do merge, revisar o escopo do diff e explicitar no PR que a suite atual passa, mas a cobertura de integracao ainda precisa ser ampliada.
