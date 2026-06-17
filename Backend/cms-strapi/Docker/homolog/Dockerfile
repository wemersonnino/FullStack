# Mimics production but can have specific homolog environment variables
# Stage 1: Build
FROM node:22-alpine AS build

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
    && npm ci --legacy-peer-deps \
    && npm cache clean --force

ENV PATH=/opt/node_modules/.bin:$PATH

WORKDIR /opt/app
COPY . .
RUN npm run build

# Stage 2: Run
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

RUN chown -R node:node /opt/app /opt/node_modules
USER node

EXPOSE 1337

CMD ["npm", "run", "start"]
