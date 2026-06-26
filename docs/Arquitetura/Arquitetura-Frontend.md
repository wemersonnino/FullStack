# 🎨 Arquitetura do Front-End — Next.js 16 + TypeScript

> **Projeto:** Plataforma Escala
> **Stack atual:** Next.js 16 + React 19 + TypeScript + Tailwind 4 + NextAuth + next-themes + Zustand + Zod + Radix UI
> **Objetivo:** construir um front-end modular, acessivel e escalavel, consumindo o backend Spring Boot por BFF e o Strapi apenas para conteudo editorial.

---

## ⚙️ 1. Estrutura de Pastas (Frontend)

```
src/
├─ app/
│ ├─ [locale]/ ← internacionalização (next-intl)
│ │ ├─ (PUBLIC)/ ← rotas públicas
│ │ │ ├─ layout.tsx
│ │ │ ├─ home/page.tsx
│ │ │ ├─ noticias/page.tsx
│ │ │ ├─ blog/page.tsx
│ │ │ └─ auth/
│ │ │ ├─ login/page.tsx
│ │ │ ├─ register/page.tsx
│ │ │ └─ forgot-password/page.tsx
│ │ ├─ (PRIVATE)/ ← rotas privadas
│ │ │ ├─ layout.tsx
│ │ │ ├─ dashboard/page.tsx
│ │ │ └─ relatorios/page.tsx
│ │ ├─ acesso-negado/page.tsx ← página 403
│ │ └─ not-found.tsx ← página 404
│ └─ api/
│ └─ auth/[...nextauth]/route.ts
│
├─ components/
│ ├─ shared/ ← componentes globais
│ │ ├─ AppProviders.tsx
│ │ ├─ AppTransitionProvider.tsx
│ │ ├─ ThemeToggle.tsx
│ │ ├─ RequireRole.tsx
│ │ ├─ HeaderPublic.tsx
│ │ ├─ HeaderPrivate.tsx
│ │ ├─ Sidebar.tsx
│ │ ├─ Toaster.tsx
│ │ └─ filters/
│ │ ├─ SearchFilter.tsx
│ │ ├─ DateRangeFilter.tsx
│ │ └─ Pagination.tsx
│ ├─ home/HomeContent.tsx
│ └─ noticias/NoticiasList.tsx
│
├─ contexts/
│ ├─ useModalContext.tsx
│ ├─ useRouterLoader.tsx
│ └─ useSidebarContext.tsx
│
├─ hooks/
│ ├─ usePermission.ts
│ ├─ useHydrated.ts
│ └─ useUserTheme.ts
│
├─ i18n/
│ ├─ i18n.ts
│ ├─ routing.ts
│ ├─ next-intl.ts
│ └─ messages/
│ ├─ pt-BR.json
│ └─ en.json
│
├─ interfaces/
│ ├─ home.interface.ts
│ ├─ noticia.interface.ts
│ └─ user.interface.ts
│
├─ lib/
│ ├─ axios.ts
│ ├─ utils.ts
│ ├─ schema/
│ │ ├─ auth.schema.ts
│ │ ├─ home.schema.ts
│ │ └─ noticia.schema.ts
│ └─ constants/
│ ├─ routes.constants.ts
│ ├─ roles.constants.ts
│ └─ date.constants.ts
│
├─ services/
│ ├─ homeservice/Home.service.ts
│ └─ noticiaservice/Noticia.service.ts
│
├─ stores/
│ └─ app.store.ts
│
├─ styles/
│ ├─ globals.css
│ └─ tailwind.css
│
├─ types/
│ ├─ next-auth.d.ts
│ ├─ env.d.ts
│ └─ global.d.ts
│
├─ public/
│ ├─ favicon.ico
│ ├─ icons/
│ └─ images/
│
└─ docker/
├─ Dockerfile
└─ docker-compose.yml
```

---

## 🧩 2. Fluxo de Renderização (SSR + CSR)

- As **pages server-side** (`page.tsx`) fazem o fetch inicial de dados (`no-store` ou `revalidate`).
- Os **componentes client-side** recebem os dados via props e interagem com o usuário.
- Padrão recomendado:

##### Server → Service (fetch) → Client Component → UI

- Exemplo:

```tsx
// app/[locale]/(PUBLIC)/home/page.tsx
import HomeContent from '@/components/home/HomeContent'
import { getHomeData } from '@/services/homeservice/Home.service'

export default async function HomePage() {
const data = await getHomeData()
return <HomeContent data={data} />
}
```

---
## 🔐 3. Autenticação com NextAuth + API Java

**Fluxo:**

1. Usuário envia credenciais para `/auth/login`.
2. NextAuth usa **CredentialsProvider** e chama a API Java `/auth/exchange`.
3. API Java retorna `{ token, user: { id, name, roles, theme } }`.
4. NextAuth salva token e roles no `session.user`.
5. `proxy.ts` e `<RequireRole>` protegem as rotas.

**Sessão Tipada:**

```ts
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      roles: string[]
      theme?: string
      token?: string
    }
  }
}
```


---
## 🌗 4. Controle de Tema (next-themes)

- O `ThemeProvider` é definido em `AppProviders.tsx`.

- Persistência automática no `localStorage`.

- Valor inicial vem de `session.user.theme` (do backend).

- Alterações futuras podem ser sincronizadas via API.

```ts
<ThemeProvider attribute="class" defaultTheme={session?.user?.theme || 'system'} enableSystem>
  {children}
</ThemeProvider>
```

---
## ⚙️ 5. Estado Global (Zustand + Contexts)

### Zustand (`stores/app.store.ts`)

```ts
import { create } from 'zustand'

type AppState = {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}))
```

### Contexts (`contexts/`)

Usados para estados locais como modais e loaders.
```ts
const ModalContext = createContext({ isOpen: false, toggle: () => {} })
```

🧠 6. Controle de Permissões (Roles)
- Middleware valida se há **token** (autenticado).

- `<RequireRole>` filtra componentes/páginas específicas.

- Layout `(PRIVATE)` é protegido com role mínima (`USER`).
```ts
<RequireRole roles={['ADMIN', 'USER']}>
  <Dashboard />
</RequireRole>
```

---

## 🧾 7. Comunicação com APIs

### `lib/axios.ts`

```ts
import axios from 'axios'
import { getSession } from 'next-auth/react'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  timeout: 15000
})

api.interceptors.request.use(async (config) => {
  const session = await getSession()
  const token = (session?.user as any)?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})
```

---

## 🌍 8. Internacionalização (next-intl)

- Rotas no formato `/[locale]/home`

- Mensagens carregadas a partir de `i18n/messages`.
```ts
import { useTranslations } from 'next-intl'
const t = useTranslations('home')
return <h1>{t('title')}</h1>
```

---

## 🧱 9. UI, Acessibilidade e Estilo

|Lib|Função|
|---|---|
|**Tailwind 4**|estilo utilitário + variáveis CSS|
|**Radix UI**|componentes acessíveis (Dialog, Tooltip, Tabs)|
|**Framer Motion**|animações de transição e loader|
|**react-hot-toast**|notificações de feedback|
|**clsx + tailwind-merge**|composição de classes|
|**@tanstack/react-table**|tabelas dinâmicas (filtros, paginação)|

**Exemplo de transição global:**
```ts
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.35 }}
>
  {children}
</motion.div>
```

---

## 🧩 10. Boas Práticas

- **Server Components:** usar para páginas e fetch inicial.

- **Client Components:** somente onde houver estado ou interação.

- **Zod:** validar formulários antes do envio.

- **SSR + cache:** usar `revalidate` de acordo com a natureza dos dados.

- **Acessibilidade:** componentes Radix com ARIA labels.

- **Segurança:** nunca salvar tokens no localStorage.

- **Responsividade:** usar `flex`, `grid` e breakpoints do Tailwind.

---
## 🧾 11. Padrões de Código

| Área           | Padrão                                                      |
| -------------- | ----------------------------------------------------------- |
| **Naming**     | camelCase para funções, PascalCase para componentes         |
| **Imports**    | absolutos usando `@/`                                       |
| **Arquivos**   | nomes descritivos (`HomeContent.tsx`, `Noticia.service.ts`) |
| **Commits**    | Conventional Commits (`feat:`, `fix:`, `refactor:`)         |
| **Formatação** | Prettier + ESLint configurados                              |

---
## 🧱 12. Comunicação com Back-End

- API Java → autenticação, usuários, preferências.

- Strapi → conteúdo dinâmico (notícias, blog).

- Integracoes futuras → folha, ERP, mensageria, mapas ou automacoes quando necessario.


Cada serviço terá seu **adapter** em `/services/`, ex:
```ts
export async function getNoticias() {
  const res = await api.get('/noticias')
  return res.data
}
```

## 🔄 13. Deploy e Build

- Build com Turbopack (`next build --turbopack`)

- Rodar via Docker Compose:
```bash
docker compose up -d --build
```

- .env` necessário:
```ini
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_STRAPI_API=http://localhost:1337
```

- Logs acessíveis via `docker logs web-app1-web`.

---
## 📅 14. Futuras Extensões

-  Testes E2E com Playwright.

-  Monitoramento com New Relic.

-  Hooks para uso offline (Service Worker).

-  Dark theme por usuário (sincronizado com backend).

-  Dashboard com gráficos dinâmicos (Recharts).

---
[^1]📘 **Autor:** Wemerson Pereira
📅 **Última atualização:** {{data_atual}}

[^1]: Autor Wemerson
