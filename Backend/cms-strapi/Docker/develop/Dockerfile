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
COPY package.json package-lock.json ./
RUN npm install -g node-gyp \
    && npm config set fetch-retry-maxtimeout 600000 -g \
    && npm ci --legacy-peer-deps \
    && npm cache clean --force
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY --chown=node:node . .
RUN chown -R node:node /opt/app /opt/node_modules
USER node

EXPOSE 1337

# Development command: enables Content-Type Builder and Auto-reload
CMD ["npm", "run", "develop"]
