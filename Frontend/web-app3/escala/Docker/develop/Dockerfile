FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV COREPACK_HOME=/home/node/.cache/node/corepack

COPY package.json pnpm-lock.yaml* ./

RUN corepack enable \
    && corepack prepare pnpm@10.33.3 --activate \
    && pnpm install --frozen-lockfile \
    && mkdir -p /app/.next \
    && mkdir -p /home/node/.cache \
    && chown -R node:node /app /home/node/.cache

# In develop, we usually copy everything or use volumes
COPY --chown=node:node . .

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV WATCHPACK_POLLING=true
ENV CHOKIDAR_USEPOLLING=1

USER node
EXPOSE 3000

CMD ["pnpm", "dev"]
