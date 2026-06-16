# Gestao Inteligente de Escalas

Projeto full-stack para gestao de escalas, usuarios, funcionarios, organizacao, ponto, relatorios e conteudo CMS.

## Componentes oficiais

- Frontend principal: `Frontend/web-app3/escala`.
- Backend oficial: `Backend/java-app1/demo`.
- CMS Strapi: `Backend/cms-strapi`.
- PostgreSQL/Docker: `Data/postgres` e `docker-compose.yml`.
- Documentacao conceitual: `docs/`.

## Backend atual

Na branch `feature/backend-upgrade-springboot-4-java-25`, o backend foi validado com:

- Spring Boot `4.1.0`.
- Java `25`.
- Maven.
- PostgreSQL em Docker.
- Swagger UI via WebJar em `http://localhost:8080/swagger-ui/index.html`.
- OpenAPI JSON em `http://localhost:8080/v3/api-docs`.

Comandos principais:

```bash
mvn test
docker compose up -d --build --force-recreate backend
```

Resultado validado: `24` testes, `0` falhas, backend `Up` no Docker Compose.
