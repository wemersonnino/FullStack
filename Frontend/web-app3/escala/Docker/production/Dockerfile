# Build Stage
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN apk add --no-cache libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@10.33.3 --activate \
    && pnpm install --frozen-lockfile
COPY . .

RUN pnpm build

# Production Stage
FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat \
    && corepack enable \
    && corepack prepare pnpm@10.33.3 --activate

COPY --from=build --chown=node:node /app/package.json ./
COPY --from=build --chown=node:node /app/pnpm-lock.yaml ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/next.config.* ./
COPY --from=build --chown=node:node /app/tailwind.config.* ./
COPY --from=build --chown=node:node /app/postcss.config.* ./
COPY --from=build --chown=node:node /app/messages ./messages

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

USER node
EXPOSE 3000

CMD ["pnpm", "start"]
