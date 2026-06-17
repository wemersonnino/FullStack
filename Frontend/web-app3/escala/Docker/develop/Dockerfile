FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json pnpm-lock.yaml* ./

RUN corepack enable \
    && corepack prepare pnpm@10.33.3 --activate \
    && pnpm install --frozen-lockfile

# In develop, we usually copy everything or use volumes
COPY --chown=node:node . .
RUN mkdir -p /app/.next && chown -R node:node /app/.next /app

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=1

USER node
EXPOSE 3000

CMD ["pnpm", "dev"]
