# Setup local do Escala

## 1. Preparar variaveis

Na raiz do repositorio:

```bash
cp .env.compose.example .env
```

Substitua todos os valores `change-me` e `replace-with`. Para gerar valores aleatorios:

```bash
openssl rand -base64 32
```

O Compose usa um unico arquivo `.env` local para injetar configuracao, mas cada servico recebe somente as variaveis de que precisa.

## 2. Validar a configuracao

```bash
docker compose config --quiet
```

Para validar apenas com placeholders, sem criar `.env`:

```bash
docker compose --env-file .env.compose.example config --quiet
```

## 3. Iniciar a stack

```bash
docker compose up -d --build
docker compose ps
```

O primeiro boot inicializa dois bancos e usuarios independentes:

- `escala_core` / `escala_api_user`: Spring Boot e dados operacionais;
- `strapi_cms` / `strapi_user`: conteudo editorial do Strapi.

O script `Data/postgres/init-multiple-databases.sh` usa variaveis de ambiente e nao contem credenciais versionadas.

## 4. Verificar servicos

```bash
curl -f http://localhost:8080/actuator/health
curl -f http://localhost:1337/admin
curl -f http://localhost:3000/api/auth/session
```

URLs principais:

- Frontend: http://localhost:3000
- Backend Spring Boot: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui/index.html
- Strapi Admin: http://localhost:1337/admin

## 5. Operacao

```bash
docker compose logs -f backend
docker compose logs -f strapi
docker compose restart backend
docker compose down
```

`docker compose down -v` remove os volumes e apaga os bancos locais. Use somente quando a perda dos dados estiver autorizada.

## Responsabilidades

- Spring Boot: autenticacao, JWT, usuarios, empresas, escalas, turnos, trocas, auditoria e demais regras operacionais.
- Strapi: landing pages, artigos, menus, SEO, campanhas, planos editoriais e conteudo legal.
- Frontend: comunica-se com Spring Boot/BFF e Strapi; nunca acessa PostgreSQL diretamente.

Nao crie nem execute uma aplicacao Strapi diretamente em `Backend/`. O unico CMS oficial e `Backend/cms-strapi`.
