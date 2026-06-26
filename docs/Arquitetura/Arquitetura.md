# 🏗️ Documento de Arquitetura do Sistema

> **Projeto:** Plataforma Escala (Estudo e Prática de Desenvolvimento Full-Stack)
> **Tecnologias atuais:** Next.js 16 + React 19 + TypeScript + TailwindCSS 4 + NextAuth + Spring Boot 4.1.0/Java 25 + PostgreSQL + Strapi v5
> **Objetivo:** construir um SaaS B2B moderno, escalavel e modular para gestao inteligente de escalas, jornada, ponto, leads e conteudo editorial.

---

## 🧱 1. Visão Geral da Arquitetura

A aplicação é dividida em **módulos front-end e back-end** comunicando-se via **APIs REST**.
O objetivo é criar uma estrutura modular e escalável, onde cada camada é independente e substituível.

Usuário → Next.js (Frontend) → API Gateway (Java Spring Boot)
↓
PostgreSQL (Banco)
↓
Strapi CMS


---

## ⚙️ 2. Stack Tecnológica

| Camada | Tecnologia | Responsabilidade |
|--------|-------------|------------------|
| **Frontend** | Next.js 16 + React 19 + TypeScript | Interface, SSR/SSG, roteamento, i18n e BFF |
| **Estilo** | TailwindCSS 4 + Radix UI + Framer Motion | UI responsiva, acessível e animada |
| **Autenticação** | NextAuth.js + OAuth2 (via API Java) | Login, roles e sessão segura |
| **Tema** | next-themes | Alternância e persistência de tema |
| **Estado Global** | Zustand + Context API | Armazenar preferências e UI global |
| **Validação** | Zod + React Hook Form | Validação de formulários e schemas |
| **Backend** | Java Spring Boot (REST API) | Lógica de negócio, autenticação, orquestração |
| **Banco de Dados** | PostgreSQL | Persistência de dados (usuários, permissões, logs) |
| **CMS** | Strapi v5 | Conteúdo editorial, landing pages, campanhas, menus, SEO e legal pages |
| **APIs Externas** | Futuras integrações | Folha, ERP, mensageria, mapas ou automações quando necessario |
| **Infraestrutura** | Docker + Docker Compose | Contêinerização e orquestração local |
| **Monitoramento** | New Relic / Grafana (futuro) | Métricas e logs |

---

## 🧩 3. Estrutura de Pastas do Front-End



`src/`
`├─ app/`
`│ ├─ [locale]/ ← Internacionalização (next-intl)`
`│ │ ├─ (PUBLIC)/ ← Rotas públicas (home, notícias, blog, auth)`
`│ │ ├─ (PRIVATE)/ ← Rotas privadas (dashboard, relatórios)`
`│ │ ├─ acesso-negado/ ← Página 403`
`│ │ └─ not-found.tsx ← Página 404`
`│ └─ api/auth/[...nextauth]/ ← Rota NextAuth (API Route)`
`│`
`├─ components/`
`│ ├─ shared/ ← Componentes reutilizáveis (AppProviders, Headers, Sidebar, Filters)`
`│ ├─ home/ ← Componentes específicos da Home`
`│ └─ noticias/ ← Componentes específicos das Notícias`
`│`
`├─ contexts/ ← Contextos de UI (Modal, Sidebar, Loader)`
`├─ hooks/ ← Hooks customizados (usePermission, useUserTheme, etc.)`
`├─ i18n/ ← Configuração e mensagens do next-intl`
`├─ interfaces/ ← Tipos de contrato com APIs externas`
`├─ lib/ ← Funções utilitárias e schemas`
`│ ├─ axios.ts ← Configuração global do axios com interceptors`
`│ ├─ schema/ ← Schemas de validação com Zod`
`│ └─ constants/ ← Constantes de rotas, roles, datas`
`├─ services/ ← Comunicação com BFF, Spring Boot, Strapi e integracoes futuras`
`├─ stores/ ← Zustand stores (estado global)`
`├─ styles/ ← Estilos globais (Tailwind)`
`├─ types/ ← Tipos globais (NextAuth, env, etc.)`
`├─ public/ ← Ícones e imagens`
`└─ docker/ ← Arquivos Dockerfile e Compose`


---

## 🔐 4. Fluxo de Autenticação (NextAuth ↔ API Java ↔ PostgreSQL)

1. **Usuário** envia credenciais pelo formulário de login (`/auth/login`).
2. **NextAuth Credentials Provider** faz requisição `POST /auth/exchange` para o **backend Java**.
3. **API Java** valida as credenciais e autentica no banco PostgreSQL.
4. API retorna:
   ```json
   {
     "token": "jwt-token-aqui",
     "user": {
       "id": 1,
       "name": "Nino",
       "email": "nino@escala.br",
       "roles": ["ADMIN", "USER"],
       "theme": "dark"
     }
   }
```

NextAuth salva o token e roles no session.user.

Middleware protege as rotas privadas verificando a existência do token.

RequireRole valida se o usuário tem permissão (roles.includes('ADMIN')).

O next-themes aplica o tema conforme session.user.theme e persiste no localStorage.

🧠 5. Controle de Tema (Next-Themes)

O ThemeProvider define o atributo class (dark ou light).

Preferência é salva no localStorage (theme).

Ao logar, o valor session.user.theme é usado como inicial.

O backend pode armazenar essa preferência para sincronização entre dispositivos.
```
<ThemeProvider attribute="class" defaultTheme={session?.user?.theme || 'system'} enableSystem>
  <AppTransitionProvider>
    {children}
  </AppTransitionProvider>
</ThemeProvider>
```
🧩 6. Comunicação entre Camadas
Origem  Destino Descrição
Next.js API Java    Login, autenticação, dados do dashboard
Next.js Strapi  Conteúdo dinâmico (notícias, banners, blog)
Next.js BFF     Relatorios, calendario, leads, ponto e fluxos protegidos
API Java    PostgreSQL  Persistência e validação de usuários, roles, logs
API Java    Strapi / integrações futuras   Conteudo editorial e orquestracao de dados externos quando necessario
🔄 7. Estado Global e Contextos
Zustand (stores/app.store.ts)

Estado persistente de UI (sidebar, tema, notificações).

Armazenamento leve e reativo.

Context API (contexts/)

Estado transitório e contextual (modais, carregamento, permissões locais).

Hooks Customizados

usePermission() → verifica roles do usuário.

useUserTheme() → sincroniza tema global.

useHydrated() → previne erros de hidratação SSR/CSR.

🌍 8. Internacionalização (i18n)

Implementada com next-intl e suporte a múltiplos idiomas.

i18n/
├─ i18n.ts        ← define locales e defaultLocale
├─ routing.ts     ← adiciona prefixos de rota
├─ next-intl.ts   ← helpers para carregar mensagens
└─ messages/
   ├─ pt-BR.json
   └─ en.json


Exemplo de uso:
```
import { useTranslations } from 'next-intl'
const t = useTranslations('home')
return <h1>{t('title')}</h1>
```
⚙️ 9. Serviços e Requisições (axios)

lib/axios.ts
```
import axios from 'axios'
import { getSession } from 'next-auth/react'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  timeout: 10000
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()
  const token = (session?.user as any)?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

🧠 10. Padrões e Boas Práticas
Área    Padrão adotado
Validação   Zod + React Hook Form
Estado global   Zustand (leve e performático)
Autenticação    NextAuth (JWT + OAuth2)
Componentes Radix UI + Tailwind
Internacionalização next-intl com [locale]
Animações   Framer Motion (transições e loaders)
Deploy  Docker Compose (front + back + db)
Cache e build   Revalidate e cache configurados por página
Controle de acesso  Middleware + RequireRole (roles dinâmicas)
🔍 11. Fluxo de Desenvolvimento Ágil

Planejamento (Sprint Planning) — definir backlog e tarefas.

Desenvolvimento (Coding Sprint) — criar features em branches feature/*.

Code Review (PR) — revisar e mesclar em develop.

Testes Locais (Docker) — validar integração entre containers.

Review Sprint — checklist de entregas + retro.

🧾 12. Próximas Extensões

 Implementar testes automatizados (Vitest / Jest).

 Criar CI/CD pipeline com GitHub Actions.

 Adicionar logs e métricas com New Relic.

 Integrar APIs externas para folha, ERP, mensageria ou dashboards quando houver necessidade de produto.

 Publicar build em ambiente cloud (AWS ECS ou Railway).

📘 Autor: Wemerson Pereira
📅 Última atualização: {{data_atual}}
📂 Local: /docs/arquitetura.md


---

💡 **instruções:**
1. crie a pasta `docs/` na raiz do projeto (se ainda não existir).
2. adicione este arquivo como `arquitetura.md`.
3. no `README.md` principal, adicione:
   ```markdown
   - [📘 Arquitetura do Projeto](./docs/arquitetura.md)
