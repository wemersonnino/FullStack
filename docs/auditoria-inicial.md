# Auditoria Inicial - Projeto Gestão Inteligente de Escalas V3

## 1. Estrutura de Pastas e Componentes Identificados

A arquitetura geral do projeto segue uma divisão modular por tecnologia e finalidade:

- **Frontend:** Localizado em `/Frontend/web-app3/escala`. Utiliza Next.js 16.2.6, React 19.2.6, TypeScript, TailwindCSS 4, NextAuth, next-intl, e Zustand. Atua consumindo o BFF em uma Arquitetura Hexagonal.
- **Backend Core:** Localizado em `/Backend/java-app1/demo`. Aplicação baseada em Java 25 e Spring Boot 4.1.0. Representa o serviço core, responsável por regras de negócio (escalas, usuários, ponto) usando Arquitetura Hexagonal.
- **CMS (Strapi):** Localizado em `/Backend/cms-strapi`. Roda Strapi v5.28.0. Usado para gerenciamento de conteúdo das landing pages, banners e marketing.
- **Banco de Dados:** Utiliza PostgreSQL (versão 16-alpine via Docker), configurado na pasta `/Data/postgres`.
- **Docker:** Orquestração completa provida na raiz pelo arquivo `docker-compose.yml`, que sobe os serviços `postgres`, `backend`, `strapi` e `frontend` em uma rede interna.
- **Documentação:** Diretório `/docs/` contém as análises, requisitos, arquiteturas e decisões técnicas (ex: `decisoes-tecnicas.md`, `Arquitetura-Backend.md`).

## 2. Status do Repositório e Branch Atual

- **Branch atual:** `feature/backend-upgrade-springboot-4-java-25`
- **Últimos commits:**
  - `c872b6f`: fix: bloqueia campos google no perfil
  - `98e146f`: correção os pontos que estavam impedindo o frontend Docker de carregar
  - `71fd83a`: merge: develop into main
- **Arquivos modificados (Não rastreados ou não comitados):**
  - Modificados: `docker-compose.yml`, `README.md`, `pom.xml`, configurações de autenticação no backend (`SecurityConfiguration.java`, etc.), entre outros.
  - Não rastreados: Documentações extras criadas (`docs/auditoria-inicial.md`, arquivos de OpenAPI, etc.) e o controlador `OpenApiController.java`.

## 3. Análise das Configurações

- **pom.xml:** Backend roda com Spring Boot 4.1.0 e Java 25. Inclui dependências do PostgreSQL, JWT (jjwt 0.11.5), e webjars para Swagger-UI.
- **package.json (Frontend):** Next.js versão 16.2.6, engine exigindo Node `>=20.9.0`. Dependências-chave: `@hookform/resolvers`, `next-auth`, `next-intl`, `zod`, `zustand`, `tailwindcss`, `radix-ui`.
- **package.json (Strapi):** Strapi versão 5.28.0, conectado via plugin PostgreSQL.
- **docker-compose.yml:** Serviço de containers isolados em subnets via bridge, usando arquivos `.env` para segurança das variáveis.
- **README.md e GEMINI.md:** Indicam que o projeto usa uma arquitetura baseada no princípio de Port and Adapters (Arquitetura Hexagonal).

## 4. Conclusão da Etapa 0

A auditoria base confirma a saúde estrutural dos repositórios locais, que estão organizados em torno de um orquestrador `docker-compose.yml`. A stack condiz rigorosamente com as especificações exigidas para iniciar as próximas implementações do SaaS Gestão Inteligente de Escalas V3. Nenhum código lógico foi removido ou alterado nesta etapa.

**Próximos Passos (Etapa 1):** Ajuste de setup, documentação de ambientes e geração de arquivos de ambiente com as URLs e chaves necessárias.