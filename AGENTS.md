# Codex Project Context

## Decisoes oficiais

- O frontend principal do produto e `Frontend/web-app3/escala`.
- `Frontend/web-app1/app` deve ser preservado para um frontend futuro, sem ser usado como referencia principal de implementacao.
- O backend oficial da aplicacao e `Backend/java-app1/demo`, em Spring Boot.
- O Strapi em `Backend/cms-strapi` fica restrito a CMS: conteudo, SEO, acessibilidade editorial, URLs e links/nome dos menus.
- O frontend nunca acessa banco de dados diretamente.
- O frontend deve se comunicar com o backend Spring Boot/BFF. O backend acessa PostgreSQL e, quando necessario, Strapi.
- O PostgreSQL roda em Docker e deve ter banco/usuario separados para Strapi e para o backend da aplicacao.

## Arquitetura alvo

- Next.js 16 + TypeScript no frontend principal.
- Spring Boot + Java LTS no backend. Preferir Java 21 LTS para estabilidade de producao.
- PostgreSQL em Docker para persistencia.
- Docker Compose com rede comum para frontend, backend, banco e Strapi.
- Ambientes: development, homolog e production via Spring profiles e variaveis de ambiente.
- Frontend com rotas publicas e privadas, tema claro/escuro, menu publico com login/cadastro e dashboard privado.
- NextAuth deve autenticar contra o Spring Boot. Strapi nao deve autenticar usuarios finais da aplicacao.
- O backend e dono de login, JWT, roles, funcionarios, setores, projetos, escalas, trocas de escala e aprovacoes.
- O produto deve evoluir como um monolito modular orientado a dominio, usando arquitetura hexagonal/Clean Architecture no backend e organizacao por features no frontend.
- A modularizacao deve refletir limites de negocio, nao apenas pastas por tipo tecnico.
- O Next.js pode atuar como BFF usando Route Handlers em `app/api/...`, mascarando URLs internas do Spring Boot e agregando dados para o cliente quando fizer sentido.

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

No backend, preferir monolito modular com Spring Boot. Spring Modulith pode ser adotado gradualmente para reforcar isolamento entre modulos, eventos de dominio e verificacao de dependencias.

## Backend: Java + Spring Boot com Arquitetura Hexagonal

O backend oficial continua sendo `Backend/java-app1/demo`. A estrutura abaixo e a referencia arquitetural para evolucao gradual do codigo. O nucleo de dominio nao deve depender do Spring: sem `@Entity`, `@Service`, `@RestController`, `@Repository` ou anotacoes de framework dentro de `domain`.

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
