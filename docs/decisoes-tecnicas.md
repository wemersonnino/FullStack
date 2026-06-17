# Decisoes Tecnicas

## 2026-06-16 - Refatoração para Arquitetura Hexagonal Estrita e Otimização via Matrizes

### Contexto

Para garantir a independência de framework exigida pela arquitetura alvo, iniciamos a refatoração do backend para isolar as regras de negócio das dependências do Spring Boot. Simultaneamente, identificamos a necessidade de otimizar a renderização do Dashboard de Escalas para suportar grandes volumes de dados sem perda de fluidez.

### Decisões confirmadas

- **Isolamento de Domínio**: Criado o pacote `core/` no backend contendo `domain` (POJOs), `port` (Interfaces) e `usecase` (Lógica pura). O framework Spring Boot agora reside apenas nos adaptadores (`adapter/`) e na configuração (`config/`).
- **Módulo de Contato Hexagonal**: Implementada a nova funcionalidade de contato seguindo 100% o padrão Hexagonal Estrito, servindo como modelo para refatorações futuras.
- **Frontend Server-Side Pattern**: Consolidado o fluxo `Server Page -> BFF -> Dumb UI`. A página de Contato (`/contato`) busca dados via BFF e delega a renderização para componentes que usam **Zod** para validação e **Zustand** para estado local.
- **Matrizes para Performance O(1)**: Implementada a estrutura de **Matriz Bidimensional [Funcionário][Dia]** no frontend para renderização da grade de escalas. Isso substitui filtros $O(N)$ por acesso direto em tempo constante, otimizando o grid para centenas de colaboradores.
- **Teoria das Cores**: Adotada paleta semântica (`SHIFT_COLORS`) para padronizar estados de escala (Cores Frias para estabilidade, Quentes para alertas), melhorando a cognição do gestor.

### Por que fizemos

- Proteger a inteligência de negócio contra mudanças tecnológicas e facilitar testes unitários puros.
- Garantir escalabilidade da interface em cenários SaaS com alta densidade de informações.
- Melhorar a experiência do desenvolvedor (DX) com validações robustas e estados previsíveis.

### Resultados

- Backend: Lógica de geração de escalas e contato totalmente desacoplada.
- Frontend: Redução drástica no tempo de renderização (scripting time) do calendário administrativo.

## 2026-06-16 - Otimização de Performance Backend e Hardening Strapi Docker

### Contexto

Durante a auditoria técnica, foram identificados gargalos de performance no `ScheduleService` (geração de escalas mensais) causados por consultas repetitivas ao banco de dados dentro de loops (problema N+1). Também foi detectado um risco de `NullPointerException` no `CheckInService` e lentidão excessiva no startup do Strapi via Docker devido ao build do admin panel em runtime.

### Decisões confirmadas

- **Otimização de Escalas (N+1)**: Refatorado o `ScheduleService` para pré-carregar escalas relacionadas e contagens de ocupação diária em lote.
- **Estruturas de Memória O(1)**: Implementado o uso de `HashSet` (chaves compostas `funcionarioId:data`) e `HashMap` para validações de regras de trabalho e lotação na JVM, garantindo tempo de busca constante.
- **Eficiência de Query**: Adicionado o método `findByIdInAndActiveTrueAndCompanyId` no `EmployeeRepository` para delegar filtragem de funcionários ativos e multi-tenant para o banco de dados SQL.
- **Segurança e Null-Safety**: Implementadas validações defensivas no `CheckInService` para garantir que `company` e `planType` não sejam nulos antes do processamento de geofencing.
- **Strapi Docker Multi-Stage**: O `Dockerfile` do Strapi foi migrado para *Multi-Stage build*. Agora o `npm run build` do painel administrativo acontece durante a criação da imagem.
- **Produção por Padrão**: O Strapi Docker passou a usar `NODE_ENV=production` e `npm run start`, eliminando o overhead de watch mode e recompilação em containers locais/produção.

### Por que fizemos

- Reduzir o tempo de geração de escalas mensais para grandes equipes, eliminando centenas de chamadas ao banco.
- Garantir estabilidade do sistema de ponto eletrônico contra falhas de configuração de empresa.
- Reduzir o tempo de startup do Strapi de minutos para segundos, facilitando o fluxo de desenvolvimento e CI/CD.

### Resultados

- Backend: `BUILD SUCCESS` via Maven, com performance de geração de escalas otimizada.
- Docker: Imagem do Strapi mais leve e rápida, com artefatos de admin panel pré-compilados.

## 2026-06-16 - Conteudo dinamico do Strapi com seed idempotente e cron

### Contexto

O frontend principal ja consome conteudo dinamico do Strapi para home, banners, menus, blog e planos. Durante a analise arquitetural foi identificado que o bootstrap do Strapi executava `scripts/seed-marketing-v3` em todo startup. Esse seed remove colecoes de marketing antes de recria-las, o que entra em conflito com o papel oficial do Strapi como CMS editorial.

### Decisoes confirmadas

- O Strapi continua restrito a CMS: conteudo, SEO, acessibilidade editorial, URLs, menus, landing pages, blog e dados comerciais exibidos publicamente.
- O seed destrutivo `seed-marketing-v3` deixou de rodar diretamente no bootstrap.
- Foi criado `scripts/ensure-marketing-content.js` para verificar se existe conteudo minimo (`landing-page` home, secoes de features e planos) antes de executar o seed.
- O seed automatico so roda quando o CMS esta vazio. Se houver conteudo parcial, a rotina registra aviso e preserva os dados.
- O cron nativo do Strapi foi configurado em `config/server.ts` e `config/cron-tasks.ts` para executar a mesma verificacao periodicamente.
- `STRAPI_FORCE_MARKETING_SEED=true` ficou reservado para ambientes descartaveis, pois permite recriar conteudo de marketing.

### Por que fizemos

- Evitar perda de conteudo criado manualmente no painel administrativo do Strapi.
- Garantir que ambientes novos ainda tenham conteudo inicial para o frontend renderizar dados dinamicos.
- Manter a responsabilidade editorial no Strapi sem transforma-lo em fonte da verdade para usuarios finais ou regras de negocio.

### Para que serve

- A home publica, secoes de marketing, planos e blog podem ser alimentados dinamicamente pelo CMS.
- Restarts do container Strapi deixam de apagar alteracoes editoriais.
- O ambiente local continua facil de subir, porque o conteudo inicial e criado automaticamente quando o banco esta vazio.

### Riscos pendentes

- Existem content types no Strapi que parecem pertencer ao dominio transacional (`company`, `user-account`, `user-theme`, `learning-progress`). Eles devem ser tratados como legado/experimento e nao como fonte oficial da aplicacao.
- Se o CMS estiver parcialmente populado, a rotina nao completa dados automaticamente para evitar sobrescrita. A correcao deve ser feita via painel ou seed manual controlado.

## 2026-06-16 - Hardening Docker local e Maven Wrapper do backend

### Contexto

O ambiente local foi revalidado na branch `develop` após falhas de build causadas por acesso instável ao Docker Hub via IPv6 no host WSL. Aproveitamos a revisão para ajustar os Dockerfiles conforme boas práticas de segurança e reprodutibilidade: evitar `latest`, reduzir camadas desnecessárias, limpar caches no mesmo layer, não copiar `.env` para imagens e executar runtimes com usuários não-root.

### Decisoes confirmadas

- O backend continua em `Backend/java-app1/demo`, com Docker multi-stage usando `maven:3.9-eclipse-temurin-25` no build e `eclipse-temurin:25-jre` no runtime.
- O runtime do backend agora cria e usa o usuário estático `app` com UID/GID `10001`.
- O JAR do backend é copiado com `COPY --chown=app:app` e o container roda com `USER app`.
- O frontend principal continua sendo `Frontend/web-app3/escala`, com Dockerfile baseado em `node:22-alpine`, Corepack e `pnpm@10.33.3`.
- O frontend usa `pnpm install --frozen-lockfile` para respeitar o lockfile e evitar instalações divergentes.
- O Strapi em `Backend/cms-strapi` usa `npm ci --legacy-peer-deps` em vez de `npm install`, mantendo instalação baseada no `package-lock.json`.
- O Strapi não copia mais `.env` para dentro da imagem. Variáveis sensíveis devem entrar em runtime via `env_file`, variáveis de ambiente ou secret manager.
- As imagens locais deixam de usar `latest`: `escala-backend:develop`, `cms-strapi:develop` e `escala-postgres:16-alpine`.
- O PostgreSQL customizado do projeto não usa mais o mesmo nome da imagem oficial `postgres:16.0-alpine`.
- O `init.sql` do PostgreSQL é montado como somente leitura.
- Cada serviço principal passou a ter `.dockerignore` próprio para reduzir contexto de build e evitar envio de artefatos locais.
- O backend recebeu Maven Wrapper (`mvnw`, `mvnw.cmd`, `.mvn/wrapper/maven-wrapper.properties`) configurado para Maven `3.8.7`.

### Por que fizemos

- Reduzir superfície de ataque de containers que não precisam rodar como root.
- Evitar que secrets locais sejam empacotados em imagens Docker.
- Deixar builds de Node e Strapi reprodutíveis a partir dos lockfiles.
- Evitar cache de gerenciadores de pacotes persistido em camadas Docker.
- Evitar ambiguidade operacional causada por tags `latest`.
- Facilitar onboarding: com `mvnw`, o backend pode ser validado sem depender da versão global do Maven, desde que exista JDK compatível.
- Separar claramente imagem customizada do projeto e imagem oficial baixada do Docker Hub.

### Para que serve

- `docker compose build postgres backend` passa a produzir imagens locais identificáveis e alinhadas ao ambiente `develop`.
- O backend roda em container com usuário não-root, reduzindo impacto caso algum processo seja comprometido.
- O frontend e o Strapi ficam menos sensíveis a variações de dependências.
- O Strapi passa a depender de configuração externa no runtime, que é o comportamento esperado para secrets.
- O PostgreSQL fica mais previsível e o script de inicialização fica protegido contra escrita acidental.

### Validacao executada

```bash
java --version
mvn --version
docker pull postgres:16.0-alpine
docker pull maven:3.9-eclipse-temurin-25
docker pull eclipse-temurin:25-jre
docker compose build postgres backend
docker compose build backend
MAVEN_USER_HOME=/tmp/m2 ./mvnw --version
MAVEN_USER_HOME=/tmp/m2 ./mvnw test
```

Resultados:

- Java local no WSL: OpenJDK `25.0.3`.
- Maven local no WSL: Apache Maven `3.8.7`.
- `docker compose build postgres backend`: sucesso.
- `docker compose build backend`: sucesso.
- `./mvnw --version`: Maven `3.8.7` usando Java `25.0.3`.
- `./mvnw test`: `24` testes, `0` falhas, `0` erros.

### Riscos pendentes

- O Maven 3.8.7 atende ao requisito do Spring Boot 4, mas a imagem Docker de build segue usando Maven `3.9` para manter alinhamento com a validação da branch Java 25.
- Warnings externos de Java 25 sobre `Jansi` e `sun.misc.Unsafe` aparecem durante execução do Maven, mas não vêm do código da aplicação e não bloquearam build/testes.
- Ainda falta ampliar testes de integração para autenticação, JPA, JWT e endpoints REST.

## 2026-06-16 - Faturamento SaaS (Billing) e Integração Stripe

### Contexto
Para habilitar a comercialização do produto, foi implementada a infraestrutura de faturamento recorrente integrada ao Stripe, seguindo o padrão de arquitetura hexagonal já estabelecido.

### Decisões confirmadas
- **Domínio de Billing**: Criadas entidades `Subscription` e `Invoice` no backend Java para rastrear o estado comercial dos tenants independentemente do gateway.
- **Portas e Adaptadores**: Definida a interface `PaymentGatewayPort` para abstrair o provedor de pagamento. O `StripeAdapter` utiliza o SDK oficial v33.0.0.
- **Webhooks Seguros**: Implementado `StripeWebhookController` para processar eventos assíncronos (pagamento aprovado, renovação, cancelamento) com validação obrigatória de assinatura digital (`Stripe-Signature`).
- **Sincronização com Strapi**: Os detalhes comerciais (preços, nomes, descrições) são consumidos dinamicamente da coleção `pricing-plan-contents` do Strapi via BFF.
- **Jornada de Conversão**: Implementada a persistência do contexto do plano escolhido. Se um usuário clica em "Assinar" na Home pública, o plano é passado via query param para o Registro/Login e preservado até a tela de checkout privada no Dashboard.
- **Segurança UX**: Adicionada a classe `cursor-pointer` globalmente ao componente `Button` e botões nativos para reforçar a interatividade.

### Validação
- Backend: Compilação Maven OK com a nova dependência do Stripe.
- Frontend: Build de produção Next.js OK, incluindo o uso de `Suspense` boundaries para lidar com parâmetros de busca em páginas estáticas.


## 2026-06-15 - Captura publica de leads e demo comercial

### Decisoes confirmadas

- O fluxo de lead comercial deve entrar por uma rota publica dedicada no Next.js (`/api/bff/leads`) e ser persistido no backend Java via `POST /api/v1/leads`.
- O backend continua como fonte da verdade para lead, consentimento, origem da campanha e status comercial.
- O consentimento explicito para contato comercial e obrigatorio no formulario publico.
- A home publica e a pagina `/demo` passam a servir como superficies de conversao.
- O Swagger/OpenAPI manual continua sendo a fonte documental do contrato e agora inclui o grupo `Marketing`.

### Riscos pendentes

- Ainda nao existe suite de testes de integracao para a nova captura de lead.
- O fluxo depende do cookie de atribuicao de campanha para enriquecer os metadados.
- O controller de leads precisa continuar sincronizado no `OpenApiController` enquanto a geracao automatica nao for reavaliada.


## 2026-06-16 - Conectividade Docker do BFF (Next.js)

### Contexto
O login retornava 401 Unauthorized mesmo com o backend saudavel. A causa era o Next.js tentando acessar `http://localhost:8080` de dentro do container, o que falhava em alcancar o container `backend`.

### Decisoes confirmadas
- A `API_BASE_URL` no `.env.local` do frontend deve usar o hostname do servico na rede Docker: `http://backend:8080`.
- A constante `ENV` em `src/constants/env.ts` foi atualizada para suportar `process.env.NEXT_INTERNAL_API_BASE_URL` ou injecao dinamica de `API_BASE_URL` via ambiente.
- O BFF (Server-side) agora utiliza a rede interna do Docker para comunicacao com o core Java, evitando problemas de resolucao de loopback.

### Validacao
- O fluxo de login (Credentials e Google) foi testado via `curl` simulando o BFF e retornou HTTP 200 e o cookie de sessao.

## 2026-06-15 - Fechamento da migracao Spring Boot 4 e Java 25

### Contexto

A branch `feature/backend-upgrade-springboot-4-java-25` foi revalidada tecnicamente antes de commit/publicacao. O backend oficial permanece em `Backend/java-app1/demo`; o caminho `backend/java` citado em prompts anteriores nao existe neste monorepo.

### Decisoes confirmadas

- Spring Boot mantido em `4.1.0`.
- Java mantido em `25`, com compilacao Maven usando `release 25`.
- Dockerfile mantido com build `maven:3.9-eclipse-temurin-25` e runtime `eclipse-temurin:25-jre`.
- Springdoc nao foi reintroduzido por incompatibilidade ja observada com Spring Boot 4/Spring Framework 7.
- Swagger/OpenAPI permanece manual via `org.webjars:swagger-ui:5.32.2` e `OpenApiController`.
- Foi adicionado `spring-boot-starter-actuator` para expor health check operacional.
- Apenas `/actuator/health`, Swagger UI, OpenAPI e rotas publicas de autenticacao ficam liberados sem JWT.

### Validacao executada

Comandos executados na branch:

```bash
git status
git branch --show-current
git log --oneline -5
git diff --stat
java -version
mvn -v
mvn test
mvn clean package
docker compose config
docker compose build backend
docker compose up -d backend
docker compose logs --tail=120 backend
curl -i http://localhost:8080/actuator/health
curl -I http://localhost:8080/swagger-ui/index.html
curl -I http://localhost:8080/v3/api-docs
```

Resultados:

- Java local: Temurin `25.0.3 LTS`.
- Maven local: `3.8.7`.
- `mvn test`: `24` testes, `0` falhas, `0` erros.
- `mvn clean package`: `BUILD SUCCESS`, `24` testes, `0` falhas, `0` erros.
- `docker compose config`: configuracao valida.
- `docker compose build backend`: imagem `escala-backend:latest` construida com sucesso.
- `docker compose up -d backend`: `escala-postgres` running e `escala-backend` started.
- Logs: Spring Boot `4.1.0`, Java `25.0.3`, Tomcat `11.0.22`, Hibernate ORM `7.4.1.Final`, PostgreSQL JDBC conectado em `postgres:5432/escala_core`.
- Health: `GET /actuator/health` retornou `200` com `{"groups":["liveness","readiness"],"status":"UP"}`.
- Swagger UI: `GET /swagger-ui/index.html` retornou `200`.
- OpenAPI JSON: `GET /v3/api-docs` retornou `200`.

### Riscos pendentes

- A suite automatizada ainda cobre principalmente dominio de escala; faltam testes de integracao para autenticacao, JPA, JWT, serializacao Jackson 3 e endpoints REST.
- `jjwt-jackson:0.11.5` ainda puxa Jackson 2 em runtime; revisar upgrade do JJWT em uma proxima frente.
- `OpenApiController` manual precisa ser atualizado sempre que endpoints REST forem alterados.
- `docker compose config` expande segredos e variaveis sensiveis de arquivos `.env`; evitar registrar essa saida integral em artefatos compartilhados e revisar gestao de secrets.
- O Compose foi migrado na branch `feature/frontend-bff-secure-api` para `API_BASE_URL` server-side e cliente usando `/api/server` para chamadas ao backend Java.
- Ainda falta remover gradualmente usos legados de `session.user.token` em rotas BFF antigas e componentes server-side, mantendo compatibilidade enquanto a migração para `/api/server` avanca.

### Decisao

A migracao Spring Boot 4.1.0 + Java 25 esta tecnicamente validada na branch `feature/backend-upgrade-springboot-4-java-25` para seguir para commit, publicacao remota e PR para `develop`, desde que o PR deixe claros os riscos de cobertura e escopo.

## 2026-06-14 - Avaliacao Spring Boot 4.1.0 e Java 25

### Contexto

Foi avaliada a migracao do backend oficial em `Backend/java-app1/demo` para Spring Boot 4.1.0 e Java 25, mantendo Maven e linguagem Java.

Branch de teste criada:

```text
feature/backend-upgrade-springboot-4-java-25
```

### Versoes identificadas

Estado original do backend:

- Spring Boot: 3.5.14.
- Java configurado no `pom.xml`: 21.
- Maven local: 3.8.7.
- Java local: 21.0.11.
- Docker backend: `maven:3.9.11-eclipse-temurin-21-alpine` e `eclipse-temurin:21-jre-alpine`.
- Dependencias principais: Spring Data JPA, Spring Security, Spring Web, PostgreSQL Driver, Lombok, JJWT 0.11.5, Springdoc OpenAPI 2.8.17.

Estado testado na branch:

- Spring Boot: 4.1.0.
- Java: 25.
- Docker backend: `maven:3.9-eclipse-temurin-25` e `eclipse-temurin:25-jre`.
- Lombok: 1.18.46 com annotation processor explicito.
- Jackson usado pelo codigo da aplicacao: pacote `tools.jackson.databind` via Spring Boot 4/Jackson 3.

Referencias oficiais usadas:

- Spring Boot 4.1.0 System Requirements: `https://docs.spring.io/spring-boot/system-requirements.html`.
- Spring Boot 4.1.0 Managed Dependency Coordinates: `https://docs.spring.io/spring-boot/appendix/dependency-versions/coordinates.html`.

### Compatibilidade

Spring Boot 4.1.0 e oficialmente compativel com Java ate Java 26 e exige Spring Framework 7.0.8 ou superior. Tambem exige Maven 3.6.3 ou superior, portanto o Maven local 3.8.7 atende ao requisito, mas a maquina local com JDK 21 nao consegue compilar `--release 25`.

Componentes observados na resolucao do build:

- Spring Framework: 7.0.8.
- Spring Security: 7.1.0.
- Spring Data JPA: 4.1.0.
- Hibernate ORM: 7.4.1.Final.
- Tomcat embarcado: 11.0.22, Servlet 6.1.
- PostgreSQL JDBC: 42.7.11.
- JUnit: 6.0.3 no BOM do Boot 4.
- Jackson principal do Boot 4: Jackson 3 em `tools.jackson.*`.

### Quebras encontradas e ajustes

1. O build local com JDK 21 falhou com `release version 25 not supported`.
   - Decisao: validar Java 25 via Docker ate a maquina local ter JDK 25 instalado.

2. Lombok nao gerava metodos durante a primeira tentativa de build Java 25.
   - Ajuste: definir `lombok.version` 1.18.46 e configurar `maven-compiler-plugin` com `annotationProcessorPaths`.

3. Spring Security 7 removeu o fluxo antigo de `DaoAuthenticationProvider` sem `UserDetailsService` no construtor.
   - Ajuste: instanciar `DaoAuthenticationProvider(userDetailsService())`.

4. `springdoc-openapi-starter-webmvc-ui:2.8.17` quebrou em runtime com `ClassNotFoundException: org.springframework.boot.autoconfigure.web.servlet.WebMvcProperties`.
   - Decisao: remover Springdoc desta branch para permitir a aplicacao subir.
   - Solucao adotada: usar `org.webjars:swagger-ui:5.32.2` e `OpenApiController` manual para servir Swagger UI e `/v3/api-docs`.

5. Remover Springdoc expôs imports antigos de Jackson 2 em dois services.
   - Ajuste: migrar `GoogleIdentityService` e `RecaptchaService` para `tools.jackson.databind.JsonNode` e `tools.jackson.databind.ObjectMapper`.

### Resultado dos comandos

Comandos relevantes executados:

```bash
git checkout -b feature/backend-upgrade-springboot-4-java-25
mvn test
docker build -t escala-backend:latest Backend/java-app1/demo
docker run --rm -v /home/nino/Projects/Backend/java-app1/demo:/workspace -v /tmp/escala-m2:/root/.m2 -w /workspace maven:3.9-eclipse-temurin-25 mvn test
docker compose up -d --build backend
docker compose ps backend
docker run --rm --network escala-network curlimages/curl:8.17.0 -i http://backend:8080/api/v1/auth/authenticate
docker compose up -d --build --force-recreate backend
curl -sS -o /tmp/swagger-host.html -w "%{http_code}" http://localhost:8080/swagger-ui/index.html
curl -sS -o /tmp/api-docs.json -w "%{http_code}" http://localhost:8080/v3/api-docs
```

Resultados:

- Depois da instalacao do JDK 25, `mvn test` local passou: 24 testes, 0 falhas, 0 erros.
- `docker run ... mvn test` passou: 24 testes, 0 falhas, 0 erros.
- `docker compose up -d --build backend` construiu a imagem e iniciou o container.
- `docker compose ps backend` mostrou o container `Up`.
- Chamada HTTP interna de autenticacao com `POST /api/v1/auth/authenticate` retornou `200`.
- `http://localhost:8080/swagger-ui/index.html` retornou `200`.
- `http://localhost:8080/v3/api-docs` retornou `200`.
- Logs finais do backend nao mostram SQL bruto `Hibernate:` com `spring.jpa.show-sql` desligado.

### Decisao

A migracao para Spring Boot 4.1.0 e Java 25 e tecnicamente viavel na branch de teste: o backend compila localmente com JDK 25, compila em Docker com JDK 25, a suite de dominio passa, a imagem Docker e construida, o servico sobe no Compose, autenticacao responde e Swagger/OpenAPI esta disponivel.

Ainda nao e seguro fazer merge em `develop` como decisao final de produto. Motivos:

- A documentacao OpenAPI/Swagger foi recuperada com implementacao manual; ainda nao ha geracao automatica de schemas enquanto Springdoc 2.8.17 permanecer incompativel com Spring Boot 4.
- A cobertura automatizada atual e pequena para o tamanho do backend: 24 testes, concentrados no dominio de escala.
- Ainda nao ha teste de integracao cobrindo autenticacao, JPA, filtros JWT, serializacao Jackson 3 e endpoints protegidos.
- JJWT 0.11.5 ainda deve ser revisado contra Java 25/Jackson 3, pois traz `jjwt-jackson` com Jackson 2 em runtime.
- A arquitetura esta em evolucao para hexagonal: o modulo de dominio de escala ja tem testes e regras isoladas, mas ainda existem controllers e services com responsabilidades de aplicacao misturadas. Esta migracao evitou reorganizacao ampla para reduzir risco comportamental.

Decisao operacional:

- Manter a branch `feature/backend-upgrade-springboot-4-java-25` para validacao.
- Nao mesclar em `develop` ate revisar a estrategia OpenAPI manual versus geracao automatica, ampliar testes de integracao e revisar JJWT.
- Para builds locais, instalar JDK 25 ou usar Docker como ambiente oficial de validacao.

### Como testar

```bash
docker run --rm -v /home/nino/Projects/Backend/java-app1/demo:/workspace -v /tmp/escala-m2:/root/.m2 -w /workspace maven:3.9-eclipse-temurin-25 mvn test
docker compose up -d --build backend
docker compose ps backend
docker run --rm --network escala-network curlimages/curl:8.17.0 -i http://backend:8080/api/v1/auth/authenticate
curl -i http://localhost:8080/swagger-ui/index.html
curl -i http://localhost:8080/v3/api-docs
```

Resultado esperado:

- Maven: `BUILD SUCCESS`, `Tests run: 24, Failures: 0, Errors: 0`.
- Compose: `escala-backend` em estado `Up`.
- Autenticacao interna com metodo `POST`: HTTP `200` para credenciais validas.
- Swagger UI: HTTP `200`.
- OpenAPI JSON: HTTP `200`.

### Proximos passos

- Manter `OpenApiController` sincronizado com os controllers reais enquanto Springdoc nao for compativel com Spring Boot 4.
- Criar testes de integracao para autenticação, filtros JWT, repositories JPA e endpoints principais.
- Revisar JJWT e avaliar upgrade para versao mais recente antes do merge.
- Manter `spring.jpa.show-sql: false` em `development`; ativar SQL bruto somente em depuracao pontual.
- Continuar a migracao arquitetural por contexto, movendo regras para `domain`/`application` e deixando controllers apenas como adaptadores HTTP.

## 2026-06-14 - Swagger/OpenAPI compativel com Spring Boot 4

### Contexto

O acesso a `http://localhost:8080/swagger-ui/index.html` deixou de funcionar depois da remocao do Springdoc durante a migracao. A tentativa de restaurar `springdoc-openapi-starter-webmvc-ui:2.8.17` compilou, mas derrubou o backend em runtime.

Erro observado nos logs:

```text
java.lang.NoClassDefFoundError: org/springframework/boot/autoconfigure/web/servlet/WebMvcProperties
```

### Decisao

Enquanto nao houver Springdoc compativel com Spring Boot 4/Spring Framework 7 no projeto, a documentacao sera servida manualmente:

- Dependencia: `org.webjars:swagger-ui:5.32.2`.
- UI: `GET /swagger-ui/index.html` e `GET /swagger-ui.html`.
- JSON: `GET /v3/api-docs`.
- Implementacao: `Backend/java-app1/demo/src/main/java/com/escala/authservice/controller/OpenApiController.java`.
- Rotas liberadas no Spring Security: `/swagger-ui.html`, `/swagger-ui/**`, `/v3/api-docs/**`, `/webjars/**`.

### Escopo documentado

O `OpenApiController` documenta os controllers reais atualmente expostos:

- `AuthenticationController`: cadastro, login, recuperacao/reset de senha, completar cadastro e Google SSO.
- `UserManagementController`: usuario atual, senha, roles, tema e listagem.
- `CompanyController`: CRUD de empresas.
- `EmployeeController`: CRUD de funcionarios.
- `OrganizationController`: setores e projetos.
- `EscalaController`: calendario operacional, filtros administrativos e usuarios escalaveis.
- `ScheduleController`: escala mensal, geracao, trocas, aprovacao de colega, decisao final e dashboard.
- `CheckInController`: registro de ponto.
- `ReportController`: relatorio de folha e exportacao CSV.
- `TeamInvitationController`: convites por empresa e token publico.

Foram validados `37` paths e `10` grupos no JSON OpenAPI.

### Validacao

```bash
mvn test
docker compose up -d --build --force-recreate backend
curl -sS -o /tmp/swagger-host.html -w "%{http_code}" http://localhost:8080/swagger-ui/index.html
curl -sS -o /tmp/api-docs.json -w "%{http_code}" http://localhost:8080/v3/api-docs
jq '.tags | length' /tmp/api-docs.json
jq '.paths | keys | length' /tmp/api-docs.json
```

Resultados:

- Testes: `24` executados, `0` falhas, `0` erros.
- Swagger UI: `200`.
- OpenAPI JSON: `200`.
- Tags: `10`.
- Paths: `37`.

### Restricoes

- Os schemas de request/response ainda sao descritivos e nao gerados automaticamente a partir dos DTOs.
- Ao alterar endpoints, e necessario atualizar manualmente o `OpenApiController`.
- Quando surgir versao do Springdoc compativel com Spring Boot 4, reavaliar substituir a documentacao manual por geracao automatica.
