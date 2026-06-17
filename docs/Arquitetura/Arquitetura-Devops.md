# ⚙️ Arquitetura DevOps — Ambientes, Docker, Build e CI/CD

> **Projeto:** Plataforma Escala
> **Objetivo:** padronizar os ambientes de execução e o fluxo de deploy contínuo para o front-end (Next.js) e back-end (Java Spring Boot + PostgreSQL).

---

## 🐳 1. Docker e Docker Compose

### 1.0 Estado atual do Docker local

O ambiente local oficial roda a partir do `docker-compose.yml` na raiz do monorepo e usa os seguintes serviços principais:

- `postgres`: banco PostgreSQL compartilhado, com bases/usuarios separados para backend Spring Boot e Strapi.
- `backend`: API oficial em `Backend/java-app1/demo`, Spring Boot 4.1.0 e Java 25.
- `strapi`: CMS em `Backend/cms-strapi`, restrito a conteúdo, SEO, acessibilidade editorial, URLs e menus.
- `frontend`: aplicação principal Next.js em `Frontend/web-app3/escala`.

As imagens locais passaram a usar tags de branch/ambiente em vez de `latest`:

| Serviço | Imagem local | Motivo |
| --- | --- | --- |
| Backend | `escala-backend:develop` | Evita ambiguidade de `latest` e deixa claro que a imagem foi construída para a branch/ambiente de desenvolvimento. |
| PostgreSQL customizado | `escala-postgres:16-alpine` | Evita sobrescrever ou confundir com a imagem oficial `postgres:*` baixada do Docker Hub. |
| Strapi | `cms-strapi:develop` | Mantém consistência com o ambiente local e facilita inspeção/limpeza de imagens. |

#### Backend Spring Boot

Arquivo: `Backend/java-app1/demo/Dockerfile`

Mudanças aplicadas:

- Build multi-stage mantido com `maven:3.9-eclipse-temurin-25`.
- Runtime mantido com `eclipse-temurin:25-jre`.
- Criação de usuário/grupo fixos `app` com UID/GID `10001`.
- `COPY --chown=app:app` para que o JAR pertença ao usuário de execução.
- `USER app` antes de `EXPOSE`/`ENTRYPOINT`.
- `.dockerignore` dedicado para excluir `.git`, IDE, `target`, logs e arquivos auxiliares.

Por que fizemos:

- Reduzir risco de execução como root dentro do container.
- Tornar permissões previsíveis entre rebuilds.
- Evitar levar artefatos locais e metadados de desenvolvimento para o contexto Docker.
- Manter compatibilidade com a validação atual de Java 25/Spring Boot 4.

Para que serve:

- O container do backend executa com menor privilégio.
- Builds ficam mais reproduzíveis.
- O contexto enviado ao Docker fica menor e mais limpo.

#### Frontend Next.js

Arquivo: `Frontend/web-app3/escala/Docker/Dockerfile`

Mudanças aplicadas:

- Stages separados para `dev`, `build` e `production`.
- Instalação de dependências via Corepack com `pnpm@10.33.3`.
- Uso de `pnpm install --frozen-lockfile`.
- `apk add --no-cache libc6-compat`, sem `apk update`.
- `COPY --chown=node:node` nos artefatos copiados para produção.
- `USER node` nos stages de desenvolvimento e produção.
- `CMD ["pnpm", "start"]` em formato JSON exec.
- Remoção do uso de fontes remotas do Google no build, substituídas por stacks locais/sistema em CSS.

Por que fizemos:

- Garantir que o lockfile seja respeitado e que a instalação seja determinística.
- Evitar cache de pacotes Alpine dentro da imagem.
- Reduzir privilégios no runtime do Next.js.
- Impedir que o build dependa de acesso externo ao Google Fonts, que pode falhar em ambiente restrito ou CI.

Para que serve:

- Builds de frontend mais previsíveis.
- Imagem com menos superfície de ataque.
- Execução local e em CI menos dependente de rede externa.

#### Strapi CMS

Arquivos:

- `Backend/cms-strapi/Docker/Dockerfile`
- `Backend/cms-strapi/src/index.ts`
- `Backend/cms-strapi/config/server.ts`
- `Backend/cms-strapi/config/cron-tasks.ts`
- `Backend/cms-strapi/scripts/ensure-marketing-content.js`

Mudanças aplicadas:

- Remoção de `apk update`; uso exclusivo de `apk add --no-cache`.
- Dependências nativas ordenadas e instaladas em um único `RUN`.
- Troca de `npm install --legacy-peer-deps` para `npm ci --legacy-peer-deps`.
- Consolidação de `node-gyp`, configuração de retry do npm, instalação e limpeza de cache em um único `RUN`.
- Remoção de `COPY .env .env`.
- `COPY --chown=node:node . .` e `USER node`.
- `.dockerignore` dedicado para excluir `.env`, `.env.*`, `node_modules`, `build`, `dist`, `.cache`, `.tmp` e logs.
- Bootstrap do CMS alterado para garantir conteúdo inicial de marketing de forma idempotente.
- Cron do Strapi habilitado para verificar periodicamente se o conteúdo base existe.

Por que fizemos:

- Evitar persistência de cache do gerenciador de pacotes em camadas Docker.
- Usar instalação reprodutível baseada no `package-lock.json`.
- Evitar que secrets ou configurações locais entrem na imagem.
- Executar o CMS com usuário não-root.
- Preservar conteúdo editorial criado no admin do Strapi entre restarts e rebuilds.
- Permitir que ambientes novos sejam inicializados automaticamente sem apagar dados já existentes.

Para que serve:

- Imagem do Strapi mais segura e previsível.
- Secrets passam a ser responsabilidade do runtime via `env_file`, variáveis de ambiente ou secret manager.
- Menor risco de divergência entre máquina local, CI e homologação.
- O frontend pode consumir dados dinâmicos do Strapi sem depender apenas de fallbacks estáticos.
- O seed de marketing passa a ser um bootstrap de ambiente vazio, não uma rotina autoritária de sobrescrita.

Variáveis operacionais:

| Variável | Padrão | Uso |
| --- | --- | --- |
| `STRAPI_CRON_ENABLED` | `true` | Liga/desliga o agendador interno do Strapi. |
| `STRAPI_MARKETING_CRON_RULE` | `0 */30 * * * *` | Frequência da verificação de conteúdo base, no formato aceito pelo `node-schedule`. |
| `STRAPI_AUTO_SEED_MARKETING` | `true` | Permite criar o conteúdo inicial quando o CMS está vazio. |
| `STRAPI_FORCE_MARKETING_SEED` | `false` | Força o seed destrutivo. Usar somente em ambiente descartável, pois recria coleções de marketing. |

#### PostgreSQL

Arquivos: `Data/postgres/Dockerfile` e `Data/postgres/docker-compose.yml`

Mudanças aplicadas:

- Imagem local nomeada como `escala-postgres:16-alpine`.
- Montagem do `init.sql` como somente leitura: `:ro`.
- Rede padronizada para `escala-network`.
- `.dockerignore` dedicado para reduzir contexto de build.

Por que fizemos:

- Separar a imagem customizada do projeto da imagem oficial do Docker Hub.
- Proteger o script de inicialização contra escrita acidental dentro do container.
- Padronizar a rede comum usada por backend, frontend, Strapi e banco.

Para que serve:

- Banco local mais fácil de identificar e reconstruir.
- Inicialização mais segura.
- Menos chance de conflito com imagens oficiais ou redes legadas.

#### Regras Docker adotadas

As mudanças seguem estas regras para Dockerfiles do projeto:

- Usar tags explícitas e evitar `latest`.
- Consolidar comandos relacionados em um único `RUN` quando fizerem parte da mesma operação.
- Combinar instalação e limpeza de cache na mesma camada.
- Usar `apk add --no-cache` em imagens Alpine.
- Usar `apt-get install -y --no-install-recommends` e limpar `/var/lib/apt/lists/*` quando houver base Debian/Ubuntu.
- Usar `COPY` para arquivos locais, reservando `ADD` apenas para casos justificados.
- Usar `CMD` e `ENTRYPOINT` em JSON exec form.
- Definir usuário estático não-root nos runtimes.
- Não copiar `.env` para dentro de imagens.
- Manter `.dockerignore` por serviço.

Validação atual:

```bash
docker compose config
docker compose build postgres backend
docker compose build backend
MAVEN_USER_HOME=/tmp/m2 ./mvnw test
```

Resultado validado em 2026-06-16:

- `docker compose build postgres backend`: sucesso.
- `docker compose build backend`: sucesso.
- Backend: `24` testes, `0` falhas, `0` erros.
- Java local no WSL: OpenJDK `25.0.3`.
- Maven local no WSL: Apache Maven `3.8.7`.
- Maven Wrapper no backend: Maven `3.8.7`, `distributionType=only-script`.

### 1.1 Estrutura de containers

```ini
docker/
├─ Dockerfile.web ← build do Next.js (frontend)
├─ Dockerfile.api ← build do Java Spring Boot
├─ docker-compose.yml ← orquestração dos containers
```

---

### 1.2 docker-compose.yml (exemplo consolidado)

```yaml
version: "3.9"
services:
  web:
    build:
      context: ..
      dockerfile: ./docker/Dockerfile.web
    container_name: escala-web
    ports:
      - "3000:3000"
    env_file:
      - ../.env
    environment:
      - NODE_ENV=production
    depends_on:
      - api
    networks:
      - escala_net

  api:
    build:
      context: ../backend
      dockerfile: ./Dockerfile.api
    container_name: escala-api
    ports:
      - "8080:8080"
    env_file:
      - ../.env
    depends_on:
      - db
    networks:
      - escala_net

  db:
    image: postgres:15
    container_name: escala-db
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=escala_db
      - POSTGRES_USER=escala_user
      - POSTGRES_PASSWORD=escala_pass
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - escala_net

volumes:
  pgdata:

networks:
  escala_net:
    driver: bridge
```

---

## 🌐 2. Variáveis de ambiente (`.env`)

### 2.1 Front-End (Next.js)

```ini
# Ambiente Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret

# APIs
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_STRAPI_API=http://localhost:1337
NEXT_PUBLIC_DOTNET_API=http://localhost:5000

# Banco (se acessar direto)
DATABASE_URL=postgresql://escala_user:escala_pass@localhost:5432/escala_db

# Tema e Analytics
NEXT_PUBLIC_THEME_DEFAULT=system
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXX
```

##### 2.2 Back-End (Spring Boot)

```ini
SPRING_PROFILES_ACTIVE=dev
DB_HOST=postgres
DB_PORT=5432
DB_NAME=escala_db
DB_USER=escala_user
DB_PASS=escala_pass
```

---

## ⚡ 3. Builds com Turbopack (Next.js)

### 3.1 Scripts principais

```bash
npm run dev       # Desenvolvimento com Turbopack
npm run build     # Build de produção otimizado
npm run start     # Servir build
npm run lint      # Eslint
npm run format    # Prettier
```

### 3.2 Otimizações

- Build incremental e cacheado por Turbopack.

- Minimização de bundles com suporte nativo a SWC.

- Pre-render de páginas estáticas (`revalidate` e `no-store`).

- `docker/Dockerfile.web` usa imagem `node:20-alpine`.


---
## 🧾 4. Logs e Observabilidade

### 4.1 Front-End

- Logs acessíveis via `docker logs escala-web`.

- Erros capturados no console do servidor Next.

- Monitoramento opcional com **New Relic** ou **Grafana Loki**.


### 4.2 Back-End

- Logs do Spring Boot (`escala-api`):

    - `/var/log/escala-api/app.log` (pode mapear via volume).

    - Structured logging com `logback-spring.xml`.

- Métricas com `Spring Actuator`:

    - `/actuator/health`

    - `/actuator/metrics`


## 🔐 5. Segurança e Permissões

|Recurso|Ação recomendada|
|---|---|
|**Tokens JWT**|Armazenados apenas em sessão (NextAuth).|
|**Variáveis sensíveis**|Nunca versionadas; apenas em `.env` local e GitHub Secrets.|
|**HTTPS**|Usar proxy reverso (Nginx ou Traefik) no deploy.|
|**CORS**|Configurado no Spring Boot (`CorsConfig.java`).|
|**Banco de Dados**|Senhas fortes + roles específicas para app.|## 🔐 5. Segurança e Permissões

|Recurso|Ação recomendada|
|---|---|
|**Tokens JWT**|Armazenados apenas em sessão (NextAuth).|
|**Variáveis sensíveis**|Nunca versionadas; apenas em `.env` local e GitHub Secrets.|
|**HTTPS**|Usar proxy reverso (Nginx ou Traefik) no deploy.|
|**CORS**|Configurado no Spring Boot (`CorsConfig.java`).|
|**Banco de Dados**|Senhas fortes + roles específicas para app.|## 🔐 5. Segurança e Permissões

|Recurso|Ação recomendada|
|---|---|
|**Tokens JWT**|Armazenados apenas em sessão (NextAuth).|
|**Variáveis sensíveis**|Nunca versionadas; apenas em `.env` local e GitHub Secrets.|
|**HTTPS**|Usar proxy reverso (Nginx ou Traefik) no deploy.|
|**CORS**|Configurado no Spring Boot (`CorsConfig.java`).|
|**Banco de Dados**|Senhas fortes + roles específicas para app.|## 🔐 5. Segurança e Permissões

|Recurso|Ação recomendada|
|---|---|
|**Tokens JWT**|Armazenados apenas em sessão (NextAuth).|
|**Variáveis sensíveis**|Nunca versionadas; apenas em `.env` local e GitHub Secrets.|
|**HTTPS**|Usar proxy reverso (Nginx ou Traefik) no deploy.|
|**CORS**|Configurado no Spring Boot (`CorsConfig.java`).|
|**Banco de Dados**|Senhas fortes + roles específicas para app.|## 🔐 5. Segurança e Permissões

|Recurso|Ação recomendada|
|---|---|
|**Tokens JWT**|Armazenados apenas em sessão (NextAuth).|
|**Variáveis sensíveis**|Nunca versionadas; apenas em `.env` local e GitHub Secrets.|
|**HTTPS**|Usar proxy reverso (Nginx ou Traefik) no deploy.|
|**CORS**|Configurado no Spring Boot (`CorsConfig.java`).|
|**Banco de Dados**|Senhas fortes + roles específicas para app.|## 🔐 5. Segurança e Permissões

|Recurso|Ação recomendada|
|---|---|
|**Tokens JWT**|Armazenados apenas em sessão (NextAuth).|
|**Variáveis sensíveis**|Nunca versionadas; apenas em `.env` local e GitHub Secrets.|
|**HTTPS**|Usar proxy reverso (Nginx ou Traefik) no deploy.|
|**CORS**|Configurado no Spring Boot (`CorsConfig.java`).|
|**Banco de Dados**|Senhas fortes + roles específicas para app.|

---
## 🔐 5. Segurança e Permissões

| Recurso             | Ação recomendada                                          |
| ------------------- | --------------------------------------------------------- |
| Tokens JWT          | Armazenados apenas em sessão (NextAuth).                  |
| Variáveis sensíveis | Nunca versionadas; apenas em .env local e GitHub Secrets. |
| HTTPS               | Usar proxy reverso (Nginx ou Traefik) no deploy.          |
| CORS                | Configurado no Spring Boot (CorsConfig.java).             |
| Banco de Dados      | Senhas fortes + roles específicas para app.               |

---
## 📦 6. Estrutura de Ambientes

|Ambiente|Descrição|URL base|
|---|---|---|
|**Local**|desenvolvimento via Docker|`http://localhost:3000`|
|**Homologação**|testes internos, com API em staging|`https://homolog.escala.ufmg.br`|
|**Produção**|versão estável pública|`https://www.escala.ufmg.br`|
## 🔁 7. CI/CD (GitHub Actions)

##### 7.1 Estrutura

```ini
.github/workflows/
├─ build-and-test.yml
├─ deploy-homolog.yml
└─ deploy-prod.yml
```

##### 7.2 Exemplo — build-and-test.yml

Este workflow é responsável por compilar o projeto, rodar os testes e verificar a qualidade do código antes de qualquer merge para o branch principal.

```yaml
name: Build and Test

on:
  push:
    branches:
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Lint and format check
        run: |
          npm run lint
          npm run format -- --check

      - name: Build project
        run: npm run build

      - name: Run tests
        run: npm test
```

### 7.3 Exemplo — deploy-docker.yml

Este workflow realiza o build de imagens Docker e o deploy automático para o servidor (ou registry) definido.

```yaml
name: Deploy to Docker Hub

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: wemersonpescala/web-app1:latest
```


---
## 8️⃣ Ambientes de Deploy

|Ambiente|Descrição|URL base|Observações|
|---|---|---|---|
|**Local**|Desenvolvimento pessoal com Docker|[http://localhost:3000](http://localhost:3000)|Build com Turbopack (`next dev`)|
|**Homologação**|Testes internos e QA|http://portalhomolog.escala.ufmg.br|Build Docker + `.env.homolog`|
|**Produção**|Ambiente real com monitoramento|https://www.escala.ufmg.br|Build otimizado + cache CDN|

---
## 9️⃣ Logs e Monitoramento

|Tipo|Ferramenta|Finalidade|
|---|---|---|
|**Logs da aplicação**|`docker logs <container>`|Depuração local|
|**Monitoramento APM**|New Relic|Desempenho e tracing|
|**Métricas de recursos**|Grafana + Prometheus|CPU, memória, containers|
|**Alertas**|Discord / Slack Webhook|Notificação de erros de build/deploy|

---

> [!feature] Integração Futura
> 🧩 Futuro: integrar OpenTelemetry para métricas unificadas no front e backend.


---
## 🔐 10. Variáveis de Ambiente (.env)

Cada ambiente possui um arquivo `.env` separado:

| Variável                                            | Descrição                       |
| --------------------------------------------------- | ------------------------------- |
| `NEXT_PUBLIC_API_BASE`                              | URL base da API Java            |
| `NEXT_PUBLIC_STRAPI_API`                            | URL do Strapi                   |
| `NEXTAUTH_URL`                                      | URL pública da aplicação        |
| `NEXTAUTH_SECRET`                                   | chave de criptografia da sessão |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | credenciais do banco            |
| `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`             | secrets para CI/CD              |
| `NEW_RELIC_LICENSE_KEY`, `NEW_RELIC_APP_NAME`       | monitoramento de produção       |

---
## 🧱 11. Boas Práticas de DevOps

- Usar **branches protegidos** (`main`, `develop`).

- Criar **feature branches** (`feature/nome-funcionalidade`).

- Cada PR deve conter:

    - Build e lint passando ✅

    - Testes automatizados ✅

    - Revisão (code review) ✅

- Deploys automáticos apenas a partir da branch `main`.

- Utilizar **versionamento semântico**:

    - `v1.0.0` — release inicial

    - `v1.1.0` — novas features

    - `v1.1.1` — hotfixes

---
## 📦 12. Estrutura Docker Simplificada

```bash
docker/
├─ Dockerfile           # build da imagem Next.js
├─ Dockerfile.api       # build da API Java
└─ docker-compose.yml   # orquestração local
```

**Dockerfile (frontend)**
```bash
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --turbopack

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

---
## 🚀 13. Fluxo CI/CD Completo

1. **Push → develop**

    - Build + lint + test → status check ✅

    - Aprovação manual ou revisão de código

2. **Merge → main**

    - Workflow de deploy dispara automaticamente

    - Docker image enviada para Docker Hub

    - Container atualizado em produção

3. **Monitoramento**

    - Logs capturados por New Relic / Grafana

    - Alertas em canal Slack ou Discord


---
## 📊 14. Futuras Integrações

| Recurso                               | Descrição                           |
| ------------------------------------- | ----------------------------------- |
| **Kubernetes (EKS ou GKE)**           | Escalabilidade automatizada         |
| **CI/CD Avançado (ArgoCD / Jenkins)** | Deploy contínuo                     |
| **Backups automáticos**               | Banco de dados e arquivos estáticos |
| **Infra as Code (Terraform)**         | Provisionamento reprodutível        |
| **CDN (Cloudflare / AWS CloudFront)** | Cache global e SSL                  |
| **Secrets Manager (AWS / GCP)**       | Gestão segura de credenciais        |

---
[^1]📘 **Autor:** Wemerson Pereira
📅 **Última atualização:** {{data_atual}}

[^1]: Autor Wemerson
