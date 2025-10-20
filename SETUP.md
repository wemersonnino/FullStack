# Setup Guide - Web App Escala

## Quick Start com Docker

### 1. Pré-requisitos
- Docker 20.10+
- Docker Compose 2.0+
- Git

### 2. Clone o Repositório
```bash
git clone https://github.com/wemersonnino/FullStack.git
cd FullStack
```

### 3. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

**Importante**: Para produção, gere chaves seguras:

```bash
# Gerar chaves aleatórias (Linux/Mac)
openssl rand -base64 32

# Ou use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Atualize as seguintes variáveis no `.env`:
- `JWT_SECRET`
- `API_TOKEN_SALT`
- `ADMIN_JWT_SECRET`
- `TRANSFER_TOKEN_SALT`
- `APP_KEYS` (lista separada por vírgulas)
- `NEXTAUTH_SECRET`

### 4. Iniciar a Aplicação

#### Ambiente de Desenvolvimento
```bash
docker-compose up -d
```

Isso irá iniciar:
- **PostgreSQL** na porta 5432
- **Backend (Strapi)** na porta 1337
- **Frontend (Next.js)** na porta 3000

#### Ambiente de Produção
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Primeira Configuração do Strapi

1. Acesse http://localhost:1337/admin
2. Crie o primeiro usuário administrador
3. Configure as permissões em **Settings > Users & Permissions Plugin > Roles**

#### Permissões Públicas Recomendadas
- `announcement`: find, findOne
- `shift`: find, findOne
- `schedule`: find, findOne

#### Permissões Autenticadas
- Todas as ações para todos os content types

### 6. Acessar as Aplicações

- **Frontend**: http://localhost:3000
- **Strapi Admin**: http://localhost:1337/admin
- **Strapi API**: http://localhost:1337/api

## Desenvolvimento Local (Sem Docker)

### Pré-requisitos
- Node.js 20+
- PostgreSQL 16
- npm ou yarn

### 1. Configurar PostgreSQL

Crie um banco de dados:
```sql
CREATE DATABASE escala;
CREATE USER strapi WITH PASSWORD 'strapi';
GRANT ALL PRIVILEGES ON DATABASE escala TO strapi;
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` em `backend/`:
```env
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=escala
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi

JWT_SECRET=your-jwt-secret
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
APP_KEYS=app1,app2,app3,app4
```

Inicie o backend:
```bash
npm run develop
```

### 3. Configurar Frontend

```bash
cd frontend
npm install
```

Crie um arquivo `.env.local` em `frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:1337/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

Inicie o frontend:
```bash
npm run dev
```

## Comandos Úteis

### Docker

```bash
# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f frontend
docker-compose logs -f backend

# Parar os serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down -v

# Reconstruir imagens
docker-compose build

# Reconstruir e reiniciar
docker-compose up -d --build
```

### Frontend

```bash
cd frontend

# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start

# Lint
npm run lint
```

### Backend

```bash
cd backend

# Desenvolvimento
npm run develop

# Build
npm run build

# Produção
npm run start

# Console Strapi
npm run console
```

## Estrutura de Dados

### Content Types Criados

1. **Shift (Turno)**
   - name: string (único)
   - startTime: time
   - endTime: time
   - description: text
   - active: boolean

2. **Schedule (Escala)**
   - title: string
   - startDate: date
   - endDate: date
   - description: text
   - status: enum (draft, active, completed, cancelled)
   - Relações: users (many-to-many), shifts (many-to-many)

3. **Announcement (Anúncio)**
   - title: string
   - content: richtext
   - priority: enum (low, medium, high, urgent)
   - startDate: datetime
   - endDate: datetime
   - active: boolean
   - Relações: targetUsers (many-to-many), author (many-to-one)

4. **Audit Log**
   - action: enum (create, read, update, delete, login, logout)
   - entityType: string
   - entityId: string
   - ipAddress: string
   - userAgent: string
   - details: json
   - timestamp: datetime
   - Relação: user (many-to-one)

## Troubleshooting

### Erro de Conexão com PostgreSQL

Se o backend não conseguir conectar ao PostgreSQL:
1. Verifique se o container do PostgreSQL está rodando: `docker ps`
2. Verifique os logs: `docker-compose logs postgres`
3. Teste a conexão: `docker exec -it escala-postgres psql -U strapi -d escala`

### Erro de Permissões no Strapi

Se as APIs retornarem 403:
1. Acesse http://localhost:1337/admin
2. Vá em Settings > Users & Permissions > Roles
3. Configure as permissões adequadas para Public e Authenticated

### Frontend não Conecta ao Backend

Verifique:
1. `NEXT_PUBLIC_API_URL` no `.env` ou `.env.local`
2. Backend está rodando na porta 1337
3. CORS está configurado no Strapi

### Erro de Build no Frontend

```bash
# Limpar cache
cd frontend
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## Backup e Restore

### Backup do Banco de Dados

```bash
docker exec escala-postgres pg_dump -U strapi escala > backup.sql
```

### Restore do Banco de Dados

```bash
docker exec -i escala-postgres psql -U strapi escala < backup.sql
```

## Segurança

### Para Produção

1. **Altere todas as senhas e secrets** no `.env`
2. **Configure SSL/TLS** para conexões com o banco
3. **Use um proxy reverso** (Nginx, Traefik) na frente das aplicações
4. **Configure CORS** adequadamente no Strapi
5. **Habilite rate limiting** no Strapi
6. **Use HTTPS** para todas as conexões
7. **Configure backups automáticos** do banco de dados

### Variáveis Sensíveis

Nunca commite:
- Arquivos `.env`
- Chaves privadas
- Senhas
- Tokens de API

## Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação oficial:
  - [Next.js](https://nextjs.org/docs)
  - [Strapi](https://docs.strapi.io)
  - [Docker](https://docs.docker.com)
