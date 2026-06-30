# Arquitetura do Frontend

Data: 2026-06-30

## Stack oficial

- Next.js `16.2.6`
- React `19.2.6`
- TypeScript `5.9.3`
- Tailwind CSS `4`
- NextAuth `4`
- next-intl
- Radix UI + componentes internos
- Zustand
- Zod

Frontend oficial: `Frontend/web-app3/escala`

## Diretrizes obrigatorias

- `page.tsx` deve ser Server Component por padrao
- o browser nao conversa direto com o backend Spring Boot para fluxos autenticados
- o browser entra pelo BFF em `src/app/api/bff/**`
- componentes cliente lidam com interacao, estado local e mutacoes, nao com regra critica de negocio
- o backend Spring Boot continua como fonte da verdade

## Estrutura real do frontend

```text
src/
├─ app/
│  ├─ [locale]/
│  │  ├─ (PUBLIC)/
│  │  └─ (PRIVATE)/
│  │     └─ dashboard/
│  │        ├─ @content
│  │        ├─ @stats
│  │        ├─ @team
│  │        ├─ aprendizado
│  │        ├─ auditoria
│  │        ├─ billing
│  │        ├─ configuracoes
│  │        ├─ empresas
│  │        ├─ escala
│  │        │  ├─ admin
│  │        │  ├─ inteligente
│  │        │  └─ trocas
│  │        ├─ marketing
│  │        ├─ perfil
│  │        ├─ projetos
│  │        ├─ rebac
│  │        ├─ relatorios
│  │        ├─ setores
│  │        └─ team
│  └─ api/
│     ├─ auth/[...nextauth]
│     ├─ bff/**
│     └─ server/[...endpoint]
├─ components/
│  ├─ auth
│  ├─ dashboard
│  ├─ home
│  ├─ shared
│  └─ ui
├─ core/
│  ├─ adapters
│  ├─ application/services
│  ├─ domain
│  └─ ports
├─ features/
│  ├─ ai
│  ├─ audit
│  ├─ contact
│  ├─ escala
│  ├─ escala-inteligente
│  ├─ rebac
│  ├─ reports
│  └─ shift-swaps
├─ infrastructure/adapters
├─ lib/
│  ├─ auth
│  ├─ bff
│  ├─ http
│  └─ schemas
├─ services
├─ i18n
├─ hooks
├─ context
└─ types
```

## Fluxo de dados padrao

### Leitura SSR

`Server Page -> service -> BFF -> backend -> props -> client component`

Exemplos:

- dashboard summary em `@stats/page.tsx`
- Escala Inteligente em `/dashboard/escala/inteligente/page.tsx`
- paginas privadas do dashboard

### Mutacao

`client component -> service/adapter -> BFF -> backend -> toast/refresh`

Exemplos:

- salvar perfil
- aprovar/rejeitar mensagem
- atualizar atribuicoes do ciclo mensal
- criar feriado

## BFF atual

O BFF explicito ja cobre:

- auth
- users
- companies
- employees
- organization
- escala
- schedules
- scheduling
- reports
- billing
- messages
- stats
- work posts
- operational capacities
- rebac
- learning progress
- external utilities (`cep`, `cnpj`, `holidays`)

A rota generica `api/server/[...endpoint]` permanece por compatibilidade, mas novas features devem preferir rotas BFF nomeadas por dominio.

## Autenticacao e sessao

- `next-auth` roda em `src/app/api/auth/[...nextauth]/route.ts`
- a sessao do browser nao deve expor o token bruto do backend como dependencia de UI
- atualizacoes de perfil no cliente devem enviar apenas campos editaveis de sessao
- o callback `trigger === 'update'` foi endurecido para nao aceitar alteracoes arbitrarias de `provider`

## Superficies de produto relevantes

### Dashboard principal

- parallel routes `@content`, `@stats`, `@team`
- header privado com notificacoes e menu de usuario

### Configuracoes

- lista de usuarios via backend paginado
- frontend normaliza `content[]` para evitar quebra de `users.map`

### Mensageria

Estado atual:

- dropdown no header
- polling de pendencias
- modal de leitura/decisao para `PERMISSION_REQUEST` e `SHIFT_SWAP`

Lacuna:

- ainda nao ha inbox completo em pagina dedicada

### Escala Inteligente

Estado atual:

- SSR para calendario, feriados, legendas, ciclo, atribuicoes, contadores e alertas
- editor operacional mensal em grade
- acoes de ciclo: validar, publicar, retificar, arquivar
- operacoes de produtividade:
  - preencher semana
  - copiar escala mensal
  - presets `5x2`, `6x1`, `12x36`
  - dif visual antes do PATCH bulk

## Estado global e utilitarios

- Zustand segue reservado para estado transversal de UI
- Contexts locais seguem em `src/context`
- adapters HTTP e mapeadores permanecem concentrados em `infrastructure/adapters`
- `lib/bff/backend.ts` centraliza o proxy server-side para o backend

## Regras para evolucao

- manter separacao entre SSR de leitura e client components de mutacao
- nao mover regra trabalhista critica para o browser
- quando um endpoint novo nascer no backend e tiver uso de produto, criar o BFF explicito correspondente
- quando uma resposta backend for paginada ou polimorfica, normalizar no adapter antes de chegar na UI
