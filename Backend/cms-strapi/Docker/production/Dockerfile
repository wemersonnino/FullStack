# Stage 1: Build the application
FROM node:22-alpine AS build

# Install build dependencies
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

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp \
    && npm config set fetch-retry-maxtimeout 600000 -g \
    && npm ci --legacy-peer-deps \
    && npm cache clean --force

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
# Pre-build the Strapi admin panel for production
RUN npm run build

# Stage 2: Production environment
FROM node:22-alpine

RUN apk add --no-cache vips-dev libpng-dev

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV HOST=0.0.0.0
ENV PORT=1337

WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules
ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY --from=build /opt/app ./

# Fix permissions
RUN chown -R node:node /opt/app /opt/node_modules
USER node

EXPOSE 1337

# Production command: high performance, pre-built assets
CMD ["npm", "run", "start"]
