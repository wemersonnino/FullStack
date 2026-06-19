# Changelog

## 2026-06-18 - Segurança Multitenant, Otimização de Performance, Normalização 3NF e Cobertura Swagger

### Adicionado
- **Capacidade Mínima Operacional:** Nova entidade `OperationalCapacity` para parametrizar o número mínimo de funcionários exigido por Posto de Trabalho e Setor.
- **Triggers PostgreSQL:** Automatização no startup via `JdbcTemplate` para injetar a função PL/pgSQL `tg_validate_operational_capacity` e o gatilho `trg_check_operational_capacity` na tabela `work_shifts`, bloqueando movimentações/exclusões inválidas.
- **Normalização 3NF (Tabela Address):** Criação da entidade `Address` para desacoplar e armazenar de forma estruturada os dados de endereço das tabelas `User` e `Company`, eliminando redundâncias e dependências transitivas.
- **Mapeamento Swagger Completo:** Novas rotas no painel Swagger UI para `AiController` (endpoints com a tag `"IA"`), `StatsController` (resumos e métricas) e `WorkPostController` (postos de trabalho).
- **Novos Schemas no Swagger:** Adicionados schemas interativos para `AiContextRequest`, `WorkPostRequest` e `LearningProgressRequest` com propriedades e exemplos reais.

### Alterado
- **Segurança Multitenant (Prevenção de BOLA/IDOR):** Refatorados serviços e controllers de funcionários (`EmployeeController`) e usuários (`UserManagementController`) para injetar a autenticação ativa, filtrando todas as listas pelo tenant do usuário requisitante e validando a pertinência nos métodos de alteração/exclusão.
- **Variáveis de Ambiente (.env) Seguras:** Alterado bootstrap em `AuthServiceApplication` para parsear e injetar variáveis de `.env` localmente no escopo do JVM.
- **Ocultação de Environment do Docker:** Removida a exposição de variáveis de ambiente em texto puro no `docker-compose.yml` para evitar vazamento em runtimes inspecionáveis.

### Corrigido
- **Gargalo N+1 Select:** Refatorado `SchedulingPersistenceAdapter.saveAll` para consultar os dados dos funcionários em lote (`findAllById`) e resolver as dependências em memória, otimizando o fluxo de inserção de escalas.
- **Swagger UI Request Bodies:** Corrigidos schemas com propriedades vazias de requisição como `ForgotPasswordRequest`, `ResetPasswordRequest` e `CompleteRegistrationRequest`.
- **Mismatch em DTO do LearningProgress:** Sincronizados os nomes dos campos da requisição no Swagger com a assinatura real do DTO record.

## 2026-06-16 - Refatoração Hexagonal Estrita e Otimização via Matrizes

### Adicionado
- Nova página de **Contato** pública com formulário validado via **Zod**.
- Loja de estado global para contato usando **Zustand**.
- Estrutura de **Matriz Bidimensional** para renderização $O(1)$ da grade de escalas.
- Novo módulo de **Contato** no backend seguindo **Arquitetura Hexagonal Estrita** (Core POJO).
- Novo `GenerateScheduleService` no Core Hexagonal, desacoplado do Spring Boot.
- Paleta semântica de cores baseada em **Teoria das Cores** para estados de turno.

### Alterado
- Refatoração do `ScheduleService` para atuar como adaptador, delegando lógica para o Core Hexagonal.
- Implementado padrão **Server Side Page -> BFF -> Dumb UI** na jornada de contato.
- Adicionada **Visão de Grade** (Grid View) no Dashboard Administrativo de escalas.

### Corrigido
- Discrepâncias arquiteturais onde regras de negócio estavam vazando para os Controllers/Services do Spring.

## 2026-06-16 - Otimização de Performance Backend e Docker Strapi

### Adicionado
- Novo método de busca em lote no `EmployeeRepository` e `WorkShiftRepository`.
- Estruturas de dados em memória (`HashSet`/`HashMap`) no `ScheduleService` para busca $O(1)$.
- Validação de null-safety no `CheckInService` (empresa e plano).

### Alterado
- Refatoração do `ScheduleService` para eliminar problemas de consultas N+1 na geração mensal de escalas.
- `Dockerfile` do Strapi migrado para **Multi-Stage Build** com pré-compilação do Admin Panel.
- `docker-compose.yml` do Strapi configurado com `NODE_ENV=production` para startup instantâneo.

### Corrigido
- Potencial `NullPointerException` no registro de ponto eletrônico.
- Lentidão crítica no carregamento inicial do container Strapi.

## 2026-06-16 - Strapi com seed idempotente e cron

### Adicionado

- Script `ensure-marketing-content.js` para criar conteudo inicial de marketing somente quando o CMS estiver vazio.
- Cron nativo do Strapi para verificar periodicamente o conteudo base consumido pelo frontend.
- Documentacao das variaveis `STRAPI_CRON_ENABLED`, `STRAPI_MARKETING_CRON_RULE`, `STRAPI_AUTO_SEED_MARKETING` e `STRAPI_FORCE_MARKETING_SEED`.

### Alterado

- Bootstrap do Strapi deixou de executar o seed destrutivo diretamente em todo startup.
- Seed automatico passa a preservar conteudo editorial existente e apenas registrar aviso quando encontra dados parciais.

### Riscos conhecidos

- `STRAPI_FORCE_MARKETING_SEED=true` recria colecoes de marketing e deve ficar restrito a ambientes descartaveis.

## 2026-06-16 - Documentacao Docker e padronizacao Escala

### Alterado

- Atualizada a documentacao de DevOps com o estado atual dos Dockerfiles e Compose do projeto Escala.
- Registradas as motivacoes dos ajustes Docker: usuarios nao-root, tags sem `latest`, `.dockerignore`, cache de pacotes, `npm ci`, `pnpm --frozen-lockfile` e secrets fora das imagens.
- Padronizadas referencias antigas de projeto para Escala nos documentos de arquitetura.
- Atualizado o fallback do banner publico para "Bem-vindo à Plataforma Escala".

### Validado

- Busca textual sem ocorrencias restantes da nomenclatura antiga fora de dependencias/artefatos ignorados.

## 2026-06-16 - Faturamento SaaS, Integração Stripe e Sincronização Strapi

### Adicionado
- Integração completa com **Stripe** no backend Java (SDK v33.0.0).
- Entidades de domínio `Subscription` e `Invoice` para gestão de faturamento.
- Endpoint de Webhook seguro com validação de assinatura para eventos do Stripe.
- Novas páginas de Billing no Dashboard: `/plans`, `/success`, `/cancel`.
- Componente `PricingTable` dinâmico que consome planos da coleção `pricing-plan-contents` do Strapi.
- Link "Planos e Faturamento" na barra lateral administrativa.
- Suporte a `NEXT_INTERNAL_API_BASE_URL` no frontend para garantir conectividade em ambientes Docker.

### Alterado
- O fluxo de autenticação (Login/Registro) agora preserva o plano selecionado na Home pública.
- Componente `Button` global e botões nativos agora exibem `cursor-pointer`.
- Páginas de autenticação envoltas em `Suspense` para suportar `useSearchParams` com rendering estático.

### Corrigido
- Erro 401 Unauthorized no login do BFF ao rodar em containers Docker.
- Falhas de build no Next.js relacionadas a `useSearchParams` fora de Suspense boundaries.


## 2026-06-15 - PLG com captura publica de leads e pagina de demo

### Adicionado

- Endpoint publico `POST /api/v1/leads` no backend para captura de lead com consentimento explicito e metadados de campanha.
- Rota BFF publica `POST /api/bff/leads` no Next.js para repassar lead ao backend sem expor token.
- Seccao de captura de lead na home publica.
- Pagina publica de demo em `/{locale}/demo` para conversao comercial.
- Atualizacao manual do OpenAPI para incluir o grupo `Marketing`.

### Alterado

- `MarketingLead` passou a registrar origem, status comercial, consentimento, `lastLoginAt` e metadados extras de UTM.
- Google SSO agora grava os novos campos de lead quando cria workspace trial a partir de acesso PLG.

### Riscos conhecidos

- O fluxo comercial foi introduzido sem uma suite dedicada de testes de integracao ainda.
- O OpenAPI continua manual e precisa permanecer sincronizado com o novo controller de leads.
- A captura publica depende do cookie de atribuicao de campanha estar presente para completar os metadados de marketing.


## 2026-06-16 - Correção de Conectividade Docker no BFF

### Corrigido
- Erro 401 Unauthorized no login causado por falha de resolucao de `localhost` dentro do container Next.js.
- Atualizada `API_BASE_URL` para `http://backend:8080` no ambiente Docker.
- Ajustada a constante `ENV` para priorizar URLs internas em chamadas server-side.

## 2026-06-16 - Base segura do BFF do frontend

### Adicionado

- Rota catch-all autenticada `GET|POST|PUT|PATCH|DELETE /api/server/[...endpoint]` no Next.js.
- Proxy server-side para o backend Java usando `API_BASE_URL`.
- Injecao de `Authorization: Bearer <accessToken>` exclusivamente no Route Handler server-side.

### Alterado

- Rotas de dominio do frontend migradas para `/api/server/api/v1/...`.
- Compose e `.env.example` deixam de configurar `NEXT_PUBLIC_API_BASE_URL`.
- Adapters server-side passam a usar `ENV.API_BASE_URL`.

### Validado

- `pnpm typecheck`: sucesso.
- `pnpm build`: sucesso, com a rota `/api/server/[...endpoint]` registrada no App Router.

### Riscos conhecidos

- `.env.local` e segredos locais sao ignorados pelo Git e precisam ser limpos/rotacionados fora do commit.
- Rotas BFF legadas de auth/upload continuam em `/api/bff` por terem fluxos publicos ou multipart especificos.
- Ainda falta remover gradualmente dependencias antigas de `session.user.token` fora do novo catch-all.

## 2026-06-15 - Finalizacao da migracao Spring Boot 4 e Java 25

### Alterado

- Backend oficial validado em `Backend/java-app1/demo`.
- Spring Boot definido em `4.1.0`.
- Java definido em `25`.
- Dockerfile do backend usando `maven:3.9-eclipse-temurin-25` no build e `eclipse-temurin:25-jre` no runtime.
- Lombok fixado em `1.18.46` com annotation processor explicito.
- Spring Security ajustado para Spring Security 7.
- Swagger/OpenAPI mantido via WebJar `swagger-ui:5.32.2` e `OpenApiController` manual.

### Adicionado

- Dependencia `spring-boot-starter-actuator`.
- Health check publico em `GET /actuator/health`.
- Documentacao manual do health check no OpenAPI.
- Documento de auditoria da migracao em `docs/auditoria-backend-springboot-4-java-25.md`.

### Validado

- `mvn test`: 24 testes, 0 falhas, 0 erros.
- `mvn clean package`: build success.
- `docker compose config`: configuracao valida.
- `docker compose build backend`: imagem construida com sucesso.
- `docker compose up -d backend`: backend iniciou com PostgreSQL.
- `GET /actuator/health`: 200, status `UP`.
- `GET /swagger-ui/index.html`: 200.
- `GET /v3/api-docs`: 200.

### Riscos conhecidos

- Cobertura de testes ainda limitada para autenticacao, JPA, JWT e endpoints.
- OpenAPI manual exige manutencao sincronizada com controllers.
- `jjwt-jackson:0.11.5` ainda deve ser revisado em relacao a Java 25/Jackson 3.
- Saida de `docker compose config` expande segredos; nao publicar logs completos dessa saida.
