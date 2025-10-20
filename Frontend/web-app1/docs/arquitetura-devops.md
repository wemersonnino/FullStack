# ⚙️ Arquitetura DevOps — Ambientes, Docker, Build e CI/CD

> **Projeto:** Plataforma Fundep
> **Objetivo:** padronizar os ambientes de execução e o fluxo de deploy contínuo para o front-end (Next.js) e back-end (Java Spring Boot + PostgreSQL).

---

## 🐳 1. Docker e Docker Compose

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
    container_name: fundep-web
    ports:
      - "3000:3000"
    env_file:
      - ../.env
    environment:
      - NODE_ENV=production
    depends_on:
      - api
    networks:
      - fundep_net

  api:
    build:
      context: ../backend
      dockerfile: ./Dockerfile.api
    container_name: fundep-api
    ports:
      - "8080:8080"
    env_file:
      - ../.env
    depends_on:
      - db
    networks:
      - fundep_net

  db:
    image: postgres:15
    container_name: fundep-db
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=fundep_db
      - POSTGRES_USER=fundep_user
      - POSTGRES_PASSWORD=fundep_pass
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - fundep_net

volumes:
  pgdata:

networks:
  fundep_net:
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
DATABASE_URL=postgresql://fundep_user:fundep_pass@localhost:5432/fundep_db

# Tema e Analytics
NEXT_PUBLIC_THEME_DEFAULT=system
NEXT_PUBLIC_ANALYTICS_ID=G-XXXXXXX
```

##### 2.2 Back-End (Spring Boot)

```ini
SPRING_PROFILES_ACTIVE=dev
DB_HOST=postgres
DB_PORT=5432
DB_NAME=fundep_db
DB_USER=fundep_user
DB_PASS=fundep_pass
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

- Logs acessíveis via `docker logs fundep-web`.

- Erros capturados no console do servidor Next.

- Monitoramento opcional com **New Relic** ou **Grafana Loki**.


### 4.2 Back-End

- Logs do Spring Boot (`fundep-api`):

    - `/var/log/fundep-api/app.log` (pode mapear via volume).

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
|**Homologação**|testes internos, com API em staging|`https://homolog.fundep.ufmg.br`|
|**Produção**|versão estável pública|`https://www.fundep.ufmg.br`|
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
          tags: wemersonpfundep/web-app1:latest
```


---
## 8️⃣ Ambientes de Deploy

|Ambiente|Descrição|URL base|Observações|
|---|---|---|---|
|**Local**|Desenvolvimento pessoal com Docker|[http://localhost:3000](http://localhost:3000)|Build com Turbopack (`next dev`)|
|**Homologação**|Testes internos e QA|http://portalhomolog.fundep.ufmg.br|Build Docker + `.env.homolog`|
|**Produção**|Ambiente real com monitoramento|https://www.fundep.ufmg.br|Build otimizado + cache CDN|

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
