# Documentação de Ambientes - Gestão Inteligente de Escalas V3

Este documento descreve os diferentes ambientes do projeto e as variáveis principais necessárias para o seu funcionamento.

## Ambientes

### 1. Local (Desenvolvimento)
O ambiente local roda principalmente via Docker Compose.
- **Frontend / Landing Page:** `http://localhost:3000`
- **Backend API (Spring Boot):** `http://localhost:8080`
- **CMS (Strapi):** `http://localhost:1337`
- **Banco de Dados:** `localhost:5432`

### 2. Homologação (Staging)
Ambiente de testes integrados e homologação de novas funcionalidades, muito similar ao ambiente de produção mas com base de dados mascarada ou reduzida e chaves de teste para integrações (ex: Google SSO, gateways de e-mail).
- **Subdomínio Frontend:** `https://staging-app.escala-demo.com`
- **Subdomínio API:** `https://staging-api.escala-demo.com`
- **Subdomínio CMS:** `https://staging-cms.escala-demo.com`

### 3. Produção (Production)
Ambiente final publicado em AWS ou Azure com escalabilidade, balanceador de carga, SSL forçado e backups ativados.
- Variáveis de ambiente configuradas no provedor cloud (K8s secrets, AWS Parameter Store, etc.).
- Proteção de rotas sensíveis e controle de acessos (WAF).

## Estrutura de Subdomínios (Futura Produção)

A arquitetura para produção prevê a separação de serviços através dos seguintes subdomínios:

- **`www.*`** : Site Institucional / Landing Pages (gerado via Next.js + Conteúdo do Strapi).
- **`app.*`** : Aplicação principal do SaaS para usuários logados.
- **`api.*`** : Core Backend em Java Spring Boot (rotas REST API).
- **`cms.*`** : Interface do Strapi CMS (Painel Administrativo para time de Marketing/Conteúdo).
- **`assets.*`** : CDN para entrega de imagens, arquivos públicos e mídias do Strapi.

## Variáveis de Ambiente Críticas

Algumas das variáveis importantes introduzidas para suporte a múltiplos ambientes e atribuição de campanhas de marketing incluem:

- `NEXT_PUBLIC_SITE_URL`: URL base do site público.
- `NEXT_PUBLIC_APP_URL`: URL base da aplicação Next.js.
- `API_BASE_URL`: URL da API backend consumida no backend-to-backend.
- `STRAPI_PUBLIC_URL`: Endpoint de leitura do CMS.
- `CAMPAIGN_COOKIE_NAME`: Nome do cookie que guarda informações de UTM (`escala_marketing_attribution`).
- `MARKETING_ATTRIBUTION_TTL_DAYS`: Tempo de expiração do cookie de marketing (padrão: 30 dias).
