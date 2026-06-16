# Estratégia de Deploy e Produção - Gestão Inteligente de Escalas V3

Este documento descreve as diretrizes para a publicação do SaaS em ambiente produtivo, garantindo escalabilidade, segurança e alta disponibilidade.

## 1. Opções de Provedores Cloud

### Opção A: Amazon Web Services (AWS) - Recomendado
- **Frontend (Next.js):** AWS Amplify ou Vercel (para melhor performance de SSR/Edge).
- **Backend (Spring Boot):** AWS ECS (Elastic Container Service) com Fargate ou App Runner.
- **CMS (Strapi):** AWS ECS com volume persistente (EFS) ou bucket S3 para mídias.
- **Banco de Dados:** AWS RDS PostgreSQL com Multi-AZ para alta disponibilidade.
- **Storage:** AWS S3 para uploads e backups.

### Opção B: Microsoft Azure
- **Frontend:** Azure Static Web Apps.
- **Backend:** Azure App Service for Containers ou Azure Kubernetes Service (AKS).
- **CMS:** Azure App Service com Azure Files para persistência.
- **Banco de Dados:** Azure Database for PostgreSQL.
- **Storage:** Azure Blob Storage.

## 2. Configuração de DNS e Subdomínios

Para garantir o isolamento e organização dos serviços:
- `www.escalas-saas.com.br`: Site Institucional e Landing Pages.
- `app.escalas-saas.com.br`: Aplicação principal (Painel do Usuário).
- `api.escalas-saas.com.br`: Core Backend API.
- `cms.escalas-saas.com.br`: Painel Administrativo Strapi.
- `assets.escalas-saas.com.br`: CDN / Mídias.

## 3. Gestão de Segurança e Secrets

- **SSL/TLS:** Certificados obrigatórios em todas as rotas via AWS Certificate Manager ou Let's Encrypt.
- **Secrets:** Não comitar arquivos `.env`. Usar **AWS Secrets Manager** ou **Azure Key Vault**.
- **WAF:** Configurar Web Application Firewall para proteção contra ataques comuns (SQL Injection, XSS).

## 4. Checklist de Lançamento (Go-Live)

1. [ ] **Backups:** Configurar rotina diária de snapshot do RDS.
2. [ ] **Logs:** Centralizar logs no CloudWatch ou ELK Stack.
3. [ ] **CORS:** Restringir `api.*` para aceitar apenas requisições de `app.*` e `www.*`.
4. [ ] **Health Checks:** Configurar monitoramento de disponibilidade `/actuator/health` no Spring Boot.
5. [ ] **Geofencing:** Validar se as chaves de API de Mapas (Google/OSM) estão configuradas para produção.
6. [ ] **SSO:** Configurar o `GOOGLE_CLIENT_ID` de produção no Google Cloud Console com as URLs de redirecionamento corretas.
7. [ ] **Cookies:** Garantir que `SECURE=true` e `HTTP_ONLY=true` estejam ativos para cookies de sessão e UTM.

## 5. Estratégia de Rollback

Em caso de falha crítica:
1. Reverter a imagem do container no ECS para a tag estável anterior.
2. No banco de dados, aplicar scripts de "down" de migração caso existam alterações de schema incompatíveis.
3. No Frontend, utilizar o rollback instantâneo da Vercel ou Amplify.
