# Changelog

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
