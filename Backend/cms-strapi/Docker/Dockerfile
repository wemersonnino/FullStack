# =============================
# 📦 Base Image
# =============================
FROM node:22-alpine

# Instala bibliotecas necessárias para o Sharp e dependências nativas
RUN apk update && apk add --no-cache \
  build-base \
  gcc \
  autoconf \
  automake \
  zlib-dev \
  libpng-dev \
  nasm \
  bash \
  vips-dev \
  git

# =============================
# ⚙️ Variáveis de ambiente
# =============================
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
ENV HOST=0.0.0.0
ENV PORT=1337

# =============================
# 📁 Instala dependências
# =============================
WORKDIR /opt/
COPY package.json package-lock.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install --legacy-peer-deps
ENV PATH=/opt/node_modules/.bin:$PATH

# =============================
# 📁 Copia o código da aplicação
# =============================
WORKDIR /opt/app
COPY --chown=node:node . .

# Copia o arquivo .env (muito importante)
COPY --chown=node:node .env .env
RUN chown node:node /opt/app
USER node

# Porta exposta
EXPOSE 1337

# =============================
# 🚀 Comando padrão
# =============================
CMD ["npm", "run", "develop"]
