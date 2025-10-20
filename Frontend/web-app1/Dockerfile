FROM node:20-alpine

WORKDIR /app
# deps básicas do next/sharp
RUN apk add --no-cache libc6-compat

# vamos instalar dependências dentro do container
COPY app/package*.json ./
#RUN npm install
RUN npm ci


# o código será montado por volume
EXPOSE 3000
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
