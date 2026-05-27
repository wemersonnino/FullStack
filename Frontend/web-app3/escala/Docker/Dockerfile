# ============================================================
# 🧩 DOCKERFILE PARA NEXT.JS (DESENVOLVIMENTO)
# ============================================================

FROM node:22-alpine AS dev

# Cria Diretório de trabalho dentro do container
WORKDIR /app

# Dependência necessária para o Sharp e Next.js
RUN apk add --no-cache libc6-compat

# Copia apenas os manifests de dependências
COPY package.json pnpm-lock.yaml ./

# Instala dependências
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate && pnpm install --frozen-lockfile

# Copia o restante do código do projeto já com ownership correto.
COPY --chown=node:node . .

# Define variáveis padrão
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=1

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando padrão
CMD ["pnpm", "dev"]

# =====================================================================
# 🏗️ ETAPA 2 — Build de Produção
# =====================================================================
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.33.3 --activate && pnpm install --frozen-lockfile
COPY . .

# Compila o projeto Next.js (gera .next/)
RUN pnpm build


# =====================================================================
# 🚀 ETAPA 3 — Container final (imagem leve de produção)
# =====================================================================
FROM node:22-alpine AS production

WORKDIR /app

# Copia apenas o build e dependências de produção
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.* ./
COPY --from=build /app/tailwind.config.* ./
COPY --from=build /app/postcss.config.* ./
COPY --from=build /app/messages ./messages

# Define variáveis de ambiente
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Expõe a porta
EXPOSE 3000

# Inicia o servidor Next.js
CMD ["corepack", "pnpm", "start"]
