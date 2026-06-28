# Codex Project Context

## Decisoes oficiais

- O frontend principal do produto e `Frontend/web-app3/escala`.
- `Frontend/web-app1/app` deve ser preservado para um frontend futuro, sem ser usado como referencia principal de implementacao.
- O backend oficial da aplicacao e `Backend/java-app1/demo`, em Spring Boot.
- Estado atual validado do backend na branch `feature/backend-upgrade-springboot-4-java-25`: Spring Boot `4.1.0`, Java `25`, Maven, Docker build com `maven:3.9-eclipse-temurin-25` e runtime `eclipse-temurin:25-jre`.
- O Strapi em `Backend/cms-strapi` fica restrito a CMS: conteudo, SEO, acessibilidade editorial, URLs e links/nome dos menus.
- O frontend nunca acessa banco de dados diretamente.
- O frontend deve se comunicar com o backend Spring Boot/BFF. O backend acessa PostgreSQL e, quando necessario, Strapi.
- O PostgreSQL roda em Docker e deve ter banco/usuario separados para Strapi e para o backend da aplicacao.
- O Swagger/OpenAPI atual do backend nao usa Springdoc, pois `springdoc-openapi-starter-webmvc-ui:2.8.17` quebra em runtime com Spring Boot 4/Spring Framework 7. A solucao vigente usa `org.webjars:swagger-ui:5.32.2` e `OpenApiController` manual em `Backend/java-app1/demo/src/main/java/com/escala/authservice/controller/OpenApiController.java`.
- O Swagger local deve responder em `http://localhost:8080/swagger-ui/index.html` e o JSON OpenAPI em `http://localhost:8080/v3/api-docs`.
- O posicionamento de produto vigente esta documentado em `docs/Analise-Produto-Arquitetura-Concorrencia-Oceano-Azul.md`.
- OKRs e roadmap atuais estao em `docs/okr.md` e `docs/roadmap.md`.
- O plano de implementacao da gestao mensal inteligente de escalas esta em `docs/plano-implementacao-gestao-mensal-inteligente-escalas.md`.

## Arquitetura alvo

- Next.js 16 + TypeScript no frontend principal.
- Spring Boot + Java LTS no backend. Java 25 LTS esta em validacao nesta branch; para producao, a decisao final ainda deve considerar maturidade de dependencias, cobertura de testes e estabilidade operacional.
- PostgreSQL em Docker para persistencia.
- Docker Compose com rede comum para frontend, backend, banco e Strapi.
- Ambientes: development, homolog e production via Spring profiles e variaveis de ambiente.
- Frontend com rotas publicas e privadas, tema claro/escuro, menu publico com login/cadastro e dashboard privado.
- NextAuth deve autenticar contra o Spring Boot. Strapi nao deve autenticar usuarios finais da aplicacao.
- O backend e dono de login, JWT, roles, funcionarios, setores, projetos, escalas, trocas de escala, aprovacoes, ponto web, leads, billing, limites comerciais, auditoria e IA operacional.
- O produto deve evoluir como um monolito modular orientado a dominio, usando arquitetura hexagonal/Clean Architecture no backend e organizacao por features no frontend.
- A modularizacao deve refletir limites de negocio, nao apenas pastas por tipo tecnico.
- O Next.js pode atuar como BFF usando Route Handlers em `app/api/...`, mascarando URLs internas do Spring Boot e agregando dados para o cliente quando fizer sentido.
- A promessa vendavel inicial deve ser escala mensal correta para PMEs, com templates, feriados, contadores, alertas e publicacao auditavel. Ponto completo, banco de horas avancado, dimensionamento e IA devem evoluir por fases.

## Modularizacao por dominio

O sistema deve ser pensado em Contextos Delimitados (Bounded Contexts), facilitando manutencao e uma futura extracao para microsservicos sem comecar com complexidade desnecessaria.

Contextos iniciais recomendados:

- `iam`: autenticacao, usuarios, perfis, roles, sessoes, JWT e permissoes.
- `organization`: funcionarios, setores, projetos, alocacoes e estrutura organizacional.
- `planning`: regras de escala, capacidade de escritorio, cobertura minima, geracao mensal/anual e limites operacionais.
- `execution`: acompanhamento do dia a dia, presenca/remoto, calendario operacional, faltas e ausencias.
- `negotiation`: solicitacoes de troca, compensacoes e maquina de estados de aprovacao.
- `notification`: email, push, Slack, MS Teams e outros canais.
- `audit`: trilha de auditoria, soft delete e rastreabilidade de alteracoes.
- `commercial`: leads, campanhas, UTM/referrer, trial, planos, limites comerciais, billing e recomendacao de plano/template.
- `content`: conteudo editorial vindo do Strapi, incluindo landing pages, menus, SEO, legal pages, artigos e formularios editoriais.

No backend, preferir monolito modular com Spring Boot. Spring Modulith pode ser adotado gradualmente para reforcar isolamento entre modulos, eventos de dominio e verificacao de dependencias.

## Backend: Java + Spring Boot com Arquitetura Hexagonal

O backend oficial continua sendo `Backend/java-app1/demo`. A estrutura abaixo e a referencia arquitetural para evolucao gradual do codigo. O nucleo de dominio nao deve depender do Spring: sem `@Entity`, `@Service`, `@RestController`, `@Repository` ou anotacoes de framework dentro de `domain`.

### Estado operacional atual do backend

- Versao atual testada: Spring Boot `4.1.0`, Spring Framework `7.0.8`, Spring Security `7.1.0`, Hibernate ORM `7.4.1.Final`, Tomcat `11.0.22`.
- Java atual testado: `25.0.3 LTS`.
- Maven local validado: `3.8.7`; Maven Docker validado: imagem `maven:3.9-eclipse-temurin-25`.
- Lombok fixado em `1.18.46`, com `maven-compiler-plugin` configurando `annotationProcessorPaths`.
- Jackson no codigo da aplicacao deve usar `tools.jackson.databind.*` quando depender dos tipos gerenciados pelo Spring Boot 4/Jackson 3.
- `ApplicationConfig` deve criar `DaoAuthenticationProvider(userDetailsService())`, conforme Spring Security 7.
- `application.yml` deve manter `spring.jpa.show-sql: false`; o profile `development` nao deve reativar SQL bruto do Hibernate sem decisao explicita.
- Nao configurar `hibernate.dialect` explicitamente para PostgreSQL nesta branch; Hibernate 7 seleciona o dialect automaticamente.
- O warning externo `sun.misc.Unsafe` aparece por Maven/Guava/Lombok em Java 25 e nao e codigo do projeto. Tratar como nao bloqueante enquanto build/testes passam.
- O backend foi validado com `mvn test`, Docker Maven test e `docker compose up -d --build --force-recreate backend`.
- Suite atual validada: `24` testes, `0` falhas, concentrados no dominio de escala. Ainda falta ampliar testes de integracao para autenticacao, JPA, JWT e endpoints.
- Existem entidades e servicos para `MarketingLead`, `TimeRecord`, `OperationalCapacity`, `WorkPost`, `AiUsage`, `Subscription`, `Invoice`, `AuditLog`, `ManagementEdge`, `ManagerAssignment` e `ManagementClosure`.
- `CheckInService` ja persiste ponto web basico em `TimeRecord`, com geolocalizacao, IP, device fingerprint e alternancia simples entre entrada/saida. Isso nao deve ser tratado como REP-P completo ou espelho de ponto assinado.
- `MarketingLeadService` ja captura nome, email, empresa, consentimento, UTM, referrer, landing page e campanha. Ainda falta evoluir segmento, faixa de colaboradores, telefone normalizado, classificacao de email pessoal/corporativo e versao de consentimento.
- `core/ai` possui `AiProviderPort`, `MockAiAdapter` e controle inicial de uso/limites. IA deve permanecer explicavel e validada por regras backend antes de qualquer efetivacao operacional.

### Documentacao OpenAPI atual

- Springdoc 2.8.17 nao deve ser reintroduzido nesta branch sem nova validacao, porque falhou em runtime procurando `org.springframework.boot.autoconfigure.web.servlet.WebMvcProperties`.
- A documentacao Swagger atual e manual, servida por `OpenApiController`.
- O controller documenta os endpoints reais dos controllers atuais em `37` paths e `10` grupos: `Auth`, `Usuarios`, `Empresas`, `Funcionarios`, `Organizacao`, `Escala Operacional`, `Escalas e Trocas`, `Ponto`, `Relatorios` e `Convites`.
- Ao adicionar ou remover endpoints REST, atualizar tambem o `OpenApiController` enquanto a geracao automatica nao estiver disponivel.

Estrutura alvo por modulo/contexto:

```text
escala-backend/
└── src/main/java/com/sistema/escala/
    ├── domain/
    │   ├── models/
    │   │   ├── Funcionario.java
    │   │   ├── EscalaTrabalho.java
    │   │   └── SolicitacaoTroca.java
    │   ├── enums/
    │   │   ├── ModalidadeTrabalho.java
    │   │   └── StatusTroca.java
    │   └── exceptions/
    │       └── TrocaInvalidaException.java
    ├── application/
    │   ├── ports/
    │   │   ├── in/
    │   │   │   ├── DefinirEscalaUseCase.java
    │   │   │   └── SolicitarTrocaUseCase.java
    │   │   └── out/
    │   │       ├── EscalaRepositoryPort.java
    │   │       └── NotificacaoPort.java
    │   └── services/
    │       ├── DefinirEscalaService.java
    │       └── GerenciarTrocaService.java
    ├── adapters/
    │   ├── in/web/
    │   │   ├── FuncionarioController.java
    │   │   ├── GestorEscalaController.java
    │   │   └── dto/
    │   └── out/persistence/
    │       ├── EscalaJpaEntity.java
    │       ├── EscalaJpaRepository.java
    │       ├── EscalaPersistenceAdapter.java
    │       └── mapper/
    └── config/
        ├── BeanConfiguration.java
        └── SecurityConfig.java
```

Responsabilidades:

- `domain`: modelos e regras de negocio puras. Exemplo: `SolicitacaoTroca` valida antecedencia minima, participantes, status e regras de aprovacao.
- `application`: casos de uso e portas. Orquestra dominio sem conhecer HTTP, banco, email ou detalhes de framework.
- `adapters/in/web`: controllers REST, DTOs de request/response e validacoes de transporte.
- `adapters/out/persistence`: entidades JPA, repositories Spring Data, adapters de persistencia e mappers entre JPA e dominio.
- `config`: wiring Spring, seguranca e criacao de beans dos services da camada `application`.

Encaixe funcional:

- Gestao pelo gestor: `GestorEscalaController` recebe JSON do Next.js/BFF e chama `DefinirEscalaUseCase`. `DefinirEscalaService` cria modelos `EscalaTrabalho`, define data e `ModalidadeTrabalho` (`PRESENCIAL` ou `REMOTO`) e salva via `EscalaRepositoryPort`.
- Troca de escala: o funcionario aciona `SolicitarTrocaUseCase`. A regra em `SolicitacaoTroca` valida a troca antes do adapter persistir a solicitacao.
- Notificacoes: casos de uso publicam eventos de dominio ou chamam `NotificacaoPort`; envio de email/mensageria deve ocorrer fora da transacao principal quando possivel.

## Frontend: Next.js + React + TypeScript + Tailwind

O frontend principal continua sendo `Frontend/web-app3/escala`. A organizacao deve migrar gradualmente para uma divisao por features, inspirada em Feature-Sliced Design, mantendo componentes de UI independentes da regra de negocio.

### Estado operacional atual do frontend

- Versao atual: Next.js `16.2.6`, React `19.2.6`, TypeScript `5.9.3`, pnpm `10.33.3`.
- Rotas publicas atuais incluem home, artigos, campanhas, landing pages segmentadas, contato, demo, login, cadastro, recuperacao de senha e convites.
- Rotas privadas atuais incluem dashboard, escala, auditoria, marketing, empresas, setores, projetos, relatorios, ReBAC, time, aprendizado, configuracoes e perfil.
- O BFF atual fica em `src/app/api/bff/...` e cobre auth, leads, check-in, escala, schedules, swap requests, relatorios, audit logs, empresas, funcionarios, organizacao, ReBAC, billing, IA, mensagens, stats e work posts.
- `src/app/api/server/[...endpoint]/route.ts` existe como rota generica; preferir rotas BFF explicitas para fluxos de produto novos.
- O arquivo `proxy.ts` e a fronteira correta para Next.js 16; nao criar `middleware.ts`.
- O frontend ja depende de `@brazilian-utils/brazilian-utils`, que pode ser usado para validacoes/formatacoes brasileiras quando fizer sentido.

Estrutura alvo:

```text
escala-frontend/
└── src/
    ├── core/
    │   ├── models/
    │   │   ├── Funcionario.ts
    │   │   ├── Escala.ts
    │   │   └── SolicitacaoTroca.ts
    │   └── utils/
    │       └── date-format.ts
    ├── infrastructure/
    │   ├── http/
    │   │   └── axios-client.ts
    │   └── api/
    │       ├── escala-api.ts
    │       └── gestor-api.ts
    ├── hooks/
    │   ├── useEscalaFuncionario.ts
    │   ├── useSolicitarTroca.ts
    │   └── useGestaoEscala.ts
    ├── features/
    │   ├── auth/
    │   ├── escala-mensal/
    │   ├── gestao-trocas/
    │   ├── funcionarios/
    │   └── dashboard/
    ├── shared/
    │   ├── components/
    │   ├── http/
    │   └── utils/
    ├── components/
    │   ├── ui/
    │   ├── escala/
    │   │   ├── CalendarioEscala.tsx
    │   │   └── ModalSolicitarTroca.tsx
    │   └── layout/
    │       └── Sidebar.tsx
    └── app/
        ├── (auth)/
        │   └── login/page.tsx
        ├── gestor/
        │   ├── dashboard/page.tsx
        │   └── definir-escala/page.tsx
        └── funcionario/
            ├── minha-escala/page.tsx
            └── trocas-pendentes/page.tsx
```

Responsabilidades:

- `core`: tipos, modelos e utilitarios de dominio independentes de UI.
- `infrastructure`: adaptadores de saida para comunicacao com API Spring Boot/BFF. Trocas de Axios, Fetch nativo ou React Query devem ficar concentradas aqui e nos hooks.
- `hooks` e `features/*`: casos de uso no frontend, estado, loading, erros e integracao com APIs.
- `components/ui`: componentes genericos, preferencialmente shadcn/ui quando ja existir no projeto.
- `components/escala` e `features/*/components`: componentes especificos do dominio de escala.
- `app`: rotas do App Router. As paginas devem compor features e componentes, evitando concentrar regra de negocio.

Encaixe funcional:

- Acompanhamento presencial/remoto: `CalendarioEscala.tsx` renderiza dias com selos visuais usando Tailwind e shadcn/ui `Badge`, por exemplo um selo azul para `REMOTO` e outro padrao para `PRESENCIAL`.
- Solicitacao de troca: a tela do funcionario usa `useSolicitarTroca`, que chama a API em `infrastructure/api` ou o BFF em `app/api/...` e trata erros de dominio retornados pelo Spring.
- Gestao de escala: telas de gestor usam `useGestaoEscala` para definir escalas, visualizar capacidade, cobertura e aprovar/rejeitar solicitacoes.
- Captura comercial: formularios publicos devem enviar dados para o BFF, que adiciona atribuicao UTM/referrer e repassa ao backend Spring Boot. Strapi define conteudo/editorial do formulario, mas nao deve persistir regra operacional do lead.

## Dominio de escala

- A API deve gerenciar escalas mensais/anuais de funcionarios.
- Um funcionario nao deve ter escalas colidindo no mesmo dia.
- A geracao inicial de escala deve distribuir funcionarios ativos de forma justa e evitar repetir funcionario em dias consecutivos quando houver alternativas.
- Funcionarios podem solicitar troca de dia e indicar compensacao em outro dia.
- Administradores aprovam ou rejeitam solicitacoes.
- Administradores visualizam calendario, faltas, solicitacoes, funcionarios, setores, projetos e alocacoes.
- Escalas devem registrar modalidade de trabalho: `PRESENCIAL` ou `REMOTO`.
- A aprovacao de troca deve evoluir para fluxo em duas etapas: aceite do colega envolvido e aprovacao final do gestor.
- A maquina de estados de troca deve contemplar, no minimo: `SOLICITADO`, `EM_ANALISE`, `APROVADO_PELO_COLEGA`, `APROVADO_PELO_GESTOR`, `EFETIVADO`, `REJEITADO` e `CANCELADO`.
- A geracao e alteracao de escalas devem considerar lotacao maxima do escritorio.
- A aprovacao de remoto/troca deve respeitar cobertura minima presencial por setor/projeto.
- Feriados regionais, ferias, licencas e atestados devem bloquear ou sinalizar dias indisponiveis.
- Alteracoes em escala devem gerar eventos de dominio para notificacao e auditoria.
- A escala mensal inteligente deve evoluir para fluxo `rascunho -> validacao -> publicacao -> retificacao -> arquivamento`, com versionamento e ciencia explicita de alertas criticos antes de publicar.
- Templates prioritarios: `5x2`, `6x1`, `12x36`; depois `4x2`, `6x2` e personalizado.
- Legendas configuraveis devem cobrir, no minimo, trabalho, folga, descanso, ferias, atestado, falta, treinamento, curso, outros trabalhados e outros ausentes.
- Feriados devem ser configuraveis por tenant/unidade, com tipos nacional, estadual, municipal e customizado. APIs externas como BrasilAPI ou bibliotecas utilitarias podem ajudar como fonte inicial, mas a regra final deve ser persistida e auditavel no backend.

## Comercial, marketing e Strapi

- O Strapi v5 em `Backend/cms-strapi` e fonte editorial para landing pages, campanhas, segmentos, artigos, menus, footer, SEO, legal pages, planos, FAQs e formularios editoriais.
- Landing pages segmentadas vivem em `/[locale]/lp/[slug]`; campanhas em `/[locale]/campanhas/[slug]`.
- UTM/referrer sao capturados pelo frontend/proxy e enviados ao backend em fluxos de lead/cadastro.
- Leads operacionais devem ser persistidos no Spring Boot, nao no Strapi.
- Nichos prioritarios PLG: igrejas, restaurantes, pequeno varejo, pequenas clinicas, tecnologia/suporte hibrido e facilities com poucos postos.
- Nichos consultivos: seguranca patrimonial, clinicas/hospitais medios, transportadoras, centros de distribuicao, call centers e operacoes 24/7.
- Mensagem central: sair da planilha e montar escala mensal correta com feriados, contadores, alertas e publicacao auditavel.

## Requisitos nao funcionais

- Auditoria: registrar quem alterou a escala, qual funcionario foi afetado, data/hora, motivo e valores antes/depois.
- Soft delete: registros relevantes de escala, solicitacoes, funcionarios e alocacoes nao devem ser removidos fisicamente sem decisao explicita de arquitetura.
- LGPD: funcionarios nao devem ver dados sensiveis de outros funcionarios. Rotas publicas nao devem expor informacoes privadas.
- Notificacoes: mudancas de escala, solicitacoes e aprovacoes devem notificar usuarios por email, push ou integracoes como Slack/MS Teams quando configurado.
- CI/CD: pipelines devem rodar testes unitarios das regras de dominio, especialmente troca de escala, antes de merge.
- Docker: ambiente local com Docker Compose deve se aproximar de homolog/producao, respeitando variaveis de ambiente e perfis.
- Comunicacao assincrona: operacoes secundarias como envio de email devem ser desacopladas via eventos, filas ou workers quando o custo justificar.

## Documentacao

- Os arquivos em `docs/` sao a fonte conceitual do projeto.
- Quando houver divergencia entre codigo e docs, preservar a intencao dos docs e evoluir o codigo gradualmente.
- A modularizacao descrita neste arquivo e diretriz de evolucao. Mudancas devem ser incrementais, mantendo endpoints existentes funcionando enquanto o codigo migra para os limites de dominio.

## Diretrizes de Seguranca, LGPD e Controle de Acessos

- **Isolamento Multi-tenant (company_id):** Todos os controllers e queries do Spring Boot que expõem ou alteram dados devem realizar a verificação explícita do `companyId` associado ao usuário autenticado, nunca permitindo cross-tenant leaks.
- **Armazenamento de Senhas:** Exigir comprimento mínimo de 8 caracteres e criptografar sempre usando BCrypt no backend.
- **Proteção do Spring Actuator:** Somente `/actuator/health` é público para verificação de status. Todos os outros endpoints do Actuator (ex: `metrics`, `prometheus`) devem requerer autenticação ou ser restritos à rede privada de monitoramento.
- **Integridade da Auditoria:** Operações de auditoria e logs no banco de dados devem ser persistidos via append-only, sendo proibida a deleção física ou atualização desses dados.
- **Cookies & Headers:** Configurar cabeçalhos HSTS, Content Security Policy (CSP), X-Frame-Options e SameSite nos cookies para proteção do Frontend contra XSS, CSRF e clickjacking.

