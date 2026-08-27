FROM node:22-alpine

RUN apk add --no-cache \
  autoconf \
  automake \
  bash \
  build-base \
  gcc \
  git \
  libpng-dev \
  nasm \
  vips-dev \
  zlib-dev

ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV HOST=0.0.0.0
ENV PORT=1337

WORKDIR /opt/
RUN mkdir -p /opt/app /opt/node_modules /opt/npm-global \
    && chown -R node:node /opt/app /opt/node_modules /opt/npm-global
COPY --chown=node:node package.json package-lock.json ./
USER node
RUN npm install -g node-gyp --prefix /opt/npm-global \
    && npm_config_fetch_retry_maxtimeout=600000 npm ci --legacy-peer-deps \
    && npm cache clean --force
ENV PATH=/opt/node_modules/.bin:/opt/npm-global/bin:$PATH

WORKDIR /opt/app
COPY --chown=node:node . .

EXPOSE 1337

# Development command: enables Content-Type Builder and Auto-reload
CMD ["npm", "run", "develop"]
