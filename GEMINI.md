# Projeto Escala - Diretrizes de Desenvolvimento

## Arquitetura
Este projeto segue rigorosamente a **Arquitetura Hexagonal (Ports and Adapters)** com um padrão de **BFF (Backend For Frontend)**.

Arquivos de contexto e produto que devem orientar novas implementacoes:

- `AGENTS.md`: contexto oficial do projeto e decisoes arquiteturais.
- `docs/Analise-Produto-Arquitetura-Concorrencia-Oceano-Azul.md`: analise atual de produto, mercado, concorrencia, Oceano Azul, SWOT e 4Ps.
- `docs/okr.md`: OKRs atuais do produto.
- `docs/roadmap.md`: roadmap atual.
- `docs/plano-implementacao-gestao-mensal-inteligente-escalas.md`: plano de implementacao da escala mensal inteligente.

### Inovações e Funcionalidades Premium
- **Ponto por Geolocalização (Geofencing):** Implementado como ponto web basico. O backend Java usa Haversine para validar a distancia contra o raio permitido da empresa e persiste `TimeRecord` com geolocalizacao, IP e device fingerprint. Isso ainda nao deve ser tratado como REP-P completo ou espelho de ponto assinado.
- **Provisionamento SaaS Multi-tenant:** Ha base de trial, billing e controle de limites por plano (`TRIAL`, `ESSENTIAL`, `PROFESSIONAL`, `CRITICAL`), mas os fluxos comerciais ainda devem ser validados por fase.
- **Gestão de Postos de Trabalho:** Cadastro e alocação de postos vinculados a projetos/contratos, permitindo controle de cobertura operacional.
- **Integração de Mapas (Abstração Hexagonal):** O sistema utiliza uma camada de abstração para mapas. Atualmente integrado com **Leaflet/OpenStreetMap**, mas preparado para migração para **Google Maps SDK** sem alteração nos componentes de negócio.
- **IA Assistente (Em implementação):** Infraestrutura com porta/adaptador e mock para analise de riscos, sugestao de substitutos e resumos, com controle de creditos por uso. IA deve sugerir e explicar; validacao e efetivacao ficam no backend.
- **Lead e campanhas:** `MarketingLead` ja captura nome, email, empresa, consentimento, UTM, referrer, landing e campanha. Ainda falta evoluir telefone, segmento, faixa de colaboradores, classificacao de email corporativo e versao de consentimento.

## Camadas do Frontend/BFF:
1.  **Interface de Usuário (UI):** Responsável apenas por renderizar componentes e capturar interações. Consome o BFF via hooks ou chamadas diretas às rotas da API.
2.  **BFF (API Routes):** Funciona como a **Porta de Entrada (Input Port)**. Recebe requisições da UI, extrai credenciais/sessão e delega a execução para a camada de Aplicação (Services).
3.  **Serviços de Aplicação (Services):** Implementam os **Casos de Uso**. Orquestram a lógica, validam permissões de negócio e utilizam Adaptadores para persistência ou integração.
4.  **Modelo de Domínio (Models):** Representa a "Verdade do Sistema". Interfaces e classes puras que definem os dados e regras centrais.
5.  **Adaptadores de Infraestrutura (Adapters):** Funcionam como a **Porta de Saída (Output Port)**. Realizam a comunicação com backends externos (Spring Boot, Strapi, BrasilAPI).
6.  **Mapeadores (Mappers):** Traduzem **DTOs** para as **Models** de domínio e vice-versa.

### Princípios Core:
- **Independência de Framework:** A lógica de negócio reside no `core/` e não depende de detalhes técnicos.
- **Desacoplamento:** O frontend consome o BFF, que orquestra a comunicação entre o **Java Spring Boot (Backend Principal)** e o **Strapi (CMS: Apenas Conteúdo UI)**.

## Marketing e Landing Pages

O sistema possui um motor dinâmico de marketing integrado ao Strapi v5:

### 1. Rotas Dinâmicas
- **Página Inicial:** `/[locale]` (Consome a Landing Page com slug `home` do Strapi).
- **Landing Pages Segmentadas:** `/[locale]/lp/[slug]` (Ex: `/pt-BR/lp/seguranca-e-facilities`).
- **Páginas de Campanha:** `/[locale]/campanhas/[slug]` (Páginas sazonais vinculadas a anúncios).

### 2. Atribuição e UTM Tracking
- O arquivo `proxy.ts` (middleware) intercepta todas as requisições para capturar parâmetros UTM (`utm_source`, `utm_medium`, `utm_campaign`) e o `referrer`.
- Esses dados são persistidos no cookie `escala_marketing_attribution` (TTL de 30 dias) e enviados ao backend Java durante o registro para análise de ROI de marketing.

### 3. Conteúdo Internacionalizado (i18n)
- O frontend envia o cabeçalho de `locale` para o Strapi em todas as requisições.
- As Landing Pages suportam versões em `pt-BR`, `en` e `es`.
- Strapi e fonte editorial. Persistencia operacional de lead, trial, usuario, escala, ponto e billing deve continuar no backend Java.

## Estado Atual do Backend
- **Versão:** Java 25 / Spring Boot 4.1.0.
- **SaaS:** Implementado `CheckPlanLimitUseCase` e `PlanLimit` domain para controle comercial.
- **Ponto:** Implementado `TimeRecord` com geofencing funcional e detecção inteligente de entrada/saída.
- **Escalas:** Motor de regras `LaborRuleEngine` validando 12x36, descansos e conflitos.
- **IA:** Infraestrutura de `AiProviderPort` com controle de créditos mensais.
- **Auditoria e Segurança:** Há isolamento estrito por `companyId` em todas as operações de banco e controllers. Novos endpoints devem reforçar o isolamento de tenant. O Actuator deve ter restrição de acesso a endpoints sensíveis de métricas/prometheus. As senhas devem ter hashing forte (BCrypt) e tamanho mínimo de 8 caracteres. A auditoria deve ser append-only.
- **Testes:** Backend validado com `mvn test`, com 24 testes e 0 falhas concentrados no dominio de escala. Ainda falta ampliar integracao para autenticacao, JPA, JWT, ponto, leads e endpoints.

## Stack Tecnológica
- **Frontend/BFF:** Next.js 16+ (TypeScript), Next-Auth, Tailwind CSS, Radix UI.
  - **Middleware (Next.js 16+):** Seguindo o novo padrão, o middleware é definido obrigatoriamente no arquivo `proxy.ts` na raiz do projeto, atuando como fronteira de rede e interceptor de requisições. NUNCA utilize `middleware.ts` nesta versão.
- **Backend CMS:** Strapi v5 (Gestão de Conteúdo: Artigos, Banners, Menus, Footers).
- **Backend Core (Principal):** `Backend/java-app1/demo`, Java Spring Boot (Gestão de Usuários, Roles, Permissões, Escalas, Batida de Ponto).
- **OpenAPI:** Swagger atual e manual via WebJar e `OpenApiController`; nao reintroduzir Springdoc nesta branch sem nova validacao com Spring Boot 4/Spring Framework 7.

## Internacionalização (i18n)
O sistema utiliza `next-intl` com suporte a múltiplos idiomas.
- **Idiomas Suportados:** `pt-BR` (Padrão), `en` (Inglês), `es` (Espanhol).
- **Estrutura:** Todas as rotas de interface residem dentro do segmento `[locale]` em `src/app/`.
- **Middleware:** O `proxy.ts` orquestra a detecção de idioma, proteção de rotas privadas e **atribuição de UTMs/Campanhas**.
