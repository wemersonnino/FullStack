# Web App Escala - Full-Stack Application

**Projeto Full-Stack de Estudo e Prática**

Aplicação full-stack moderna para gestão de escalas e turnos de trabalho, construída para prática e aperfeiçoamento técnico, integrando arquitetura moderna, componentização avançada, autenticação segura e headless CMS.

## 🚀 Stack Tecnológica

### Frontend
- **Next.js 15** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **NextAuth.js** - Autenticação e autorização
- **next-themes** - Gerenciamento de temas (dark/light mode)
- **next-intl** - Internacionalização (i18n) - PT/EN
- **Zustand** - Gerenciamento de estado
- **Zod** - Validação de schemas
- **Radix UI** - Componentes acessíveis

### Backend
- **Strapi v5** - Headless CMS e REST API
- **TypeScript** - Tipagem para o backend
- **PostgreSQL 16** - Banco de dados relacional

### Infraestrutura
- **Docker & Docker Compose** - Containerização e orquestração
- **Node.js 20** - Runtime JavaScript

## 📋 Funcionalidades

### Gestão de Usuários
- Autenticação segura com NextAuth
- Perfis de usuário
- Controle de permissões

### Gestão de Turnos
- Cadastro de turnos de trabalho
- Definição de horários (início/fim)
- Ativação/desativação de turnos

### Gestão de Escalas
- Criação de escalas de trabalho
- Associação de usuários e turnos
- Períodos de vigência
- Status (rascunho, ativo, concluído, cancelado)

### Sistema de Anúncios
- Criação de anúncios
- Níveis de prioridade
- Período de exibição
- Direcionamento por usuário

### Auditoria
- Registro de todas as ações do sistema
- Rastreamento de usuários
- Logs de operações CRUD
- Registro de login/logout

## 🏗️ Estrutura do Projeto

```
FullStack/
├── frontend/              # Aplicação Next.js
│   ├── app/              # App Router
│   │   ├── [locale]/    # Rotas internacionalizadas
│   │   └── api/         # API Routes
│   ├── components/       # Componentes React
│   ├── lib/             # Utilitários e configurações
│   ├── messages/        # Arquivos de tradução (i18n)
│   └── i18n/            # Configuração de internacionalização
├── backend/              # API Strapi
│   ├── config/          # Configurações do Strapi
│   ├── database/        # Configurações do banco
│   └── src/
│       └── api/         # Content Types e APIs
│           ├── shift/           # Turnos
│           ├── schedule/        # Escalas
│           ├── announcement/    # Anúncios
│           └── audit-log/       # Auditoria
└── docker-compose.yml    # Orquestração Docker
```

## 🚀 Como Executar

### Pré-requisitos
- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento local)
- npm ou yarn

### Com Docker (Recomendado)

1. Clone o repositório:
```bash
git clone https://github.com/wemersonnino/FullStack.git
cd FullStack
```

2. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie os containers:
```bash
docker-compose up -d
```

4. Acesse as aplicações:
- **Frontend**: http://localhost:3000
- **Backend (Strapi)**: http://localhost:1337/admin
- **PostgreSQL**: localhost:5432

### Desenvolvimento Local

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm run develop
```

## 🔧 Configuração

### Variáveis de Ambiente

Consulte o arquivo `.env.example` para todas as variáveis necessárias.

**Principais variáveis:**
- `DATABASE_*`: Configurações do PostgreSQL
- `NEXTAUTH_SECRET`: Segredo para NextAuth
- `JWT_SECRET`, `API_TOKEN_SALT`, etc.: Segredos do Strapi

### Primeira Execução

1. Ao acessar o Strapi pela primeira vez (http://localhost:1337/admin), crie um usuário administrador
2. Configure as permissões das APIs em Settings > Users & Permissions
3. Configure as chaves de API se necessário

## 📚 APIs Disponíveis

### Strapi REST API
- `/api/shifts` - Gestão de turnos
- `/api/schedules` - Gestão de escalas
- `/api/announcements` - Gestão de anúncios
- `/api/audit-logs` - Logs de auditoria
- `/api/auth/local` - Autenticação

## 🌍 Internacionalização

A aplicação suporta múltiplos idiomas:
- 🇧🇷 Português (padrão)
- 🇺🇸 Inglês

Arquivos de tradução em `frontend/messages/`.

## 🎨 Temas

Suporte para múltiplos temas via next-themes:
- ☀️ Light mode
- 🌙 Dark mode
- 💻 System (automático)

## 🧪 Testes

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

## 📦 Build para Produção

### Frontend
```bash
cd frontend
npm run build
npm run start
```

### Backend
```bash
cd backend
npm run build
npm run start
```

## 🤝 Contribuindo

Este é um projeto de estudo. Contribuições são bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto é open source e está disponível para fins educacionais.

## 👤 Autor

**Wemerson Nino**
- GitHub: [@wemersonnino](https://github.com/wemersonnino)

## 🙏 Agradecimentos

Projeto desenvolvido para estudo e prática de tecnologias modernas de desenvolvimento full-stack.

---

**Stack:** Next.js 15 • TypeScript • Tailwind CSS 4 • Strapi v5 • PostgreSQL 16 • Docker
