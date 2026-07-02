# Proposta de implementacao - Escala inteligente

Data: 2026-06-26.
Branch: `feature/plano-implementacao-features-escala-inteligente`.

## Objetivo

Consolidar a documentacao do projeto em uma proposta de implementacao incremental para transformar a aplicacao em um SaaS B2B multi-tenant de escala mensal inteligente, com entrada simples por planilha, validacao trabalhista parametrizavel, publicacao auditavel, simulacao de custos, dimensionamento e base futura para IA.

Esta proposta respeita as decisoes oficiais:

- Frontend principal: `Frontend/web-app3/escala`.
- Backend oficial: `Backend/java-app1/demo`.
- Strapi restrito a CMS/editorial.
- Frontend sempre via BFF/backend, sem acesso direto ao banco.
- Regras criticas no backend Spring Boot.
- OpenAPI manual atualizado em `OpenApiController` ao criar/remover endpoints.

## Documentacao considerada

- `docs/plano-implementacao-gestao-mensal-inteligente-escalas.md`
- `docs/analise-materiais-externos-features-pages.md`
- `docs/okr.md`
- `docs/roadmap.md`
- `docs/Analise-Produto-Arquitetura-Concorrencia-Oceano-Azul.md`
- `docs/analise-seguranca-dados-produto-2026.md`
- `docs/observabilidade-testes-carga-jmeter.md`
- `docs/arquitetura-nuvem-aws-azure-producao.md`
- `docs/Requisitos.md`
- `docs/Regras-de-Negocio.md`
- `docs/Arquitetura/*`
- `docs/frontend-backend-route-coverage.md`
- `docs/api/swagger-openapi.md`

## Conclusao da analise

A direcao de produto esta bem alinhada: a primeira promessa vendavel deve ser sair da planilha e montar uma escala mensal correta, com templates, feriados, contadores, alertas e publicacao auditavel.

A melhor implementacao nao e comecar por IA ou ponto completo. O caminho mais forte e:

```text
fundacao de calendario/legendas/feriados
-> rascunho de escala mensal
-> validacao e alertas
-> publicacao versionada
-> portal do colaborador e notificacoes
-> banco de horas/ponto/dimensionamento
-> simuladores, otimizacao e IA explicavel
```

As novas analises de planilhas, artigos e materiais externos acrescentam quatro oportunidades de produto:

- simulacao de custo de escala e folha;
- diagnostico de horas extras com Matriz GUT e 5W2H;
- gerador inteligente explicavel com metricas de equidade;
- monitor de intrajornada, interjornada e risco de fadiga.

Essas oportunidades devem entrar depois da fundacao da escala mensal, para nao aumentar complexidade antes de estabilizar o fluxo principal.

## Principios de implementacao

- Monolito modular no backend, com evolucao gradual para limites de dominio.
- Regras novas no modulo `core/scheduling` ou em submodulos claros, evitando aumentar services legados sem necessidade.
- Controllers e DTOs podem nascer nos pacotes atuais para compatibilidade, mas a regra deve ficar em services/use cases de dominio.
- Nenhum componente React deve carregar regra trabalhista critica.
- BFF explicito para fluxos novos em `src/app/api/bff/...`; evitar depender da rota generica `api/server/[...endpoint]`.
- Toda leitura crescente deve nascer paginada ou com periodo limitado.
- Toda operacao em lote deve ser idempotente.
- Toda mudanca critica de escala deve gerar auditoria.
- Regras trabalhistas sensiveis devem ser parametrizaveis por tenant/unidade/categoria e validadas juridicamente antes de virar bloqueio absoluto.

## Fase 0 - Preparacao tecnica

Objetivo: reduzir risco antes de novas features.

Backend:

- Introduzir Flyway ou Liquibase e trocar producao/homolog para `ddl-auto=validate`.
- Revisar entidades operacionais para garantir `company_id` direto onde faltar, principalmente em tabelas de alto volume.
- Adicionar DTOs/projections para endpoints que ainda retornam entidades JPA diretamente.
- Padronizar paginacao em endpoints administrativos: employees, users, messages, audit logs, swap requests e organization.
- Revisar `JwtAuthenticationFilter` para tratar token malformado como anonimo em rotas publicas como `/actuator/health`.
- Atualizar `OpenApiController` a cada endpoint novo.

Frontend:

- Mapear as telas privadas atuais de escala, colaboradores, relatorios, auditoria e configuracoes.
- Criar uma area de feature `features/scheduling` ou equivalente seguindo o padrao local.
- Criar clients BFF tipados para schedules, holidays, legends, publications e validations.

Banco:

- Criar indices por `company_id`, periodo, status e entidade operacional.
- Preparar constraints para evitar colisao de escala ativa por funcionario/data.

Observabilidade:

- Expor metricas Actuator alem de health no profile apropriado.
- Preparar OpenTelemetry Java Agent e correlacao de request no BFF.

Aceite:

- `mvn test` passa.
- `pnpm run build` ou typecheck passa no frontend.
- Swagger manual documenta endpoints existentes.
- Nenhum endpoint novo retorna lista sem periodo/paginacao.

## Fase 1 - Fundacao da escala mensal

Objetivo: entregar o bloco minimo para substituir planilha.

Backend - dominio:

- `ScheduleCycle`: ciclo mensal por empresa, unidade, mes, ano, timezone, status e versao.
- `ScheduleDay`: dia calculado do ciclo com fim de semana e feriado aplicado.
- `LegendCode`: sigla configuravel com impacto operacional.
- `HolidayCalendar` e `Holiday`: feriados por tenant/unidade.
- `ScheduleAssignment`: alocacao diaria por colaborador, legenda, turno e modalidade.
- `ScheduleCounterSnapshot`: contadores mensais por colaborador.

Servicos:

- `MonthlyCalendarService`: gera dias do mes com timezone.
- `HolidayService`: CRUD e aplicacao de feriados.
- `LegendImpactCalculator`: calcula impacto de cada legenda.
- `MonthlyCounterCalculator`: calcula dias, horas e totais.
- `ScheduleDraftService`: cria e altera rascunho.

Endpoints backend sugeridos:

- `GET /api/v1/scheduling/month-calendar?year=&month=&unitId=`
- `GET /api/v1/scheduling/legends`
- `POST /api/v1/scheduling/legends`
- `GET /api/v1/scheduling/holidays?year=&unitId=`
- `POST /api/v1/scheduling/holidays`
- `POST /api/v1/scheduling/cycles`
- `GET /api/v1/scheduling/cycles/{id}`
- `PATCH /api/v1/scheduling/cycles/{id}/assignments`
- `GET /api/v1/scheduling/cycles/{id}/counters`

Frontend:

- Evoluir `/dashboard/escala` para grid mensal com colaboradores nas linhas e dias nas colunas.
- Criar configuracao de legendas.
- Criar configuracao de feriados.
- Criar conversor de jornada reutilizavel.
- Criar contadores visiveis por colaborador.

BFF:

- `src/app/api/bff/scheduling/month-calendar/route.ts`
- `src/app/api/bff/scheduling/legends/route.ts`
- `src/app/api/bff/scheduling/holidays/route.ts`
- `src/app/api/bff/scheduling/cycles/route.ts`

Aceite:

- Gerar calendario para meses com 28, 29, 30 e 31 dias.
- Criar rascunho mensal.
- Aplicar feriados e finais de semana.
- Contar dias trabalhados, ausentes, descansos e horas previstas.
- Nenhuma regra critica calculada apenas no client.

## Fase 2 - Templates e validacao

Objetivo: acelerar criacao de escala e reduzir erro operacional.

Backend - dominio:

- `ScheduleTemplate`
- `ScheduleTemplatePattern`
- `ScheduleValidationAlert`
- `RestIntervalRule`
- `ValidationAcknowledgement`

Templates MVP:

- `5x2`
- `6x1`
- `12x36`

Templates preparados para depois:

- `4x2`
- `6x2`
- `4x3`
- espanhola
- `24x48`
- personalizado

Servicos:

- `ScheduleTemplateService`
- `ScheduleComplianceValidator`
- `RestAndFatigueRiskService` basico
- `FairRestDistributionService` inicial

Validacoes minimas:

- 44h semanais.
- 10h/dia quando aplicavel.
- 11h de interjornada.
- DSR semanal.
- Mais de seis dias consecutivos.
- Trabalho em domingo/feriado sem regra configurada.
- Conflito com ferias, ausencia ou atestado.
- Intrajornada planejada ausente em jornadas longas.

Endpoints backend sugeridos:

- `GET /api/v1/scheduling/templates`
- `POST /api/v1/scheduling/cycles/{id}/apply-template`
- `POST /api/v1/scheduling/cycles/{id}/validate`
- `GET /api/v1/scheduling/cycles/{id}/alerts`
- `POST /api/v1/scheduling/cycles/{id}/alerts/{alertId}/acknowledge`

Frontend:

- Wizard em `/dashboard/escala/wizard`.
- Tela de validacao em `/dashboard/escala/validacao`.
- Mostrar alertas por severidade, colaborador, data e regra.
- Permitir ciencia de alertas nao bloqueantes.
- Bloquear publicacao de alerta critico sem ciencia/configuracao.

Aceite:

- Aplicar 5x2, 6x1 e 12x36 em rascunho.
- Validar e explicar alertas.
- Atualizar contadores apos cada ajuste.
- Registrar audit log de ciencia de alerta critico.

## Fase 3 - Publicacao, versionamento e portal do colaborador

Objetivo: transformar rascunho em escala oficial auditavel.

Backend - dominio:

- `SchedulePublication`
- `ScheduleVersion`
- `ScheduleAcknowledgement`
- `ScheduleRetification`
- eventos de dominio para notificacao e auditoria.

Fluxo:

```text
RASCUNHO -> EM_VALIDACAO -> PUBLICADO -> RETIFICADO -> ARQUIVADO
```

Endpoints backend sugeridos:

- `POST /api/v1/scheduling/cycles/{id}/publish`
- `POST /api/v1/scheduling/cycles/{id}/retify`
- `POST /api/v1/scheduling/cycles/{id}/archive`
- `GET /api/v1/scheduling/publications`
- `GET /api/v1/scheduling/publications/{id}`
- `POST /api/v1/scheduling/publications/{id}/acknowledge`
- `GET /api/v1/scheduling/me`

Frontend:

- `/dashboard/escala/publicacoes`
- `/dashboard/escala/publicacoes/[id]`
- `/dashboard/colaborador/minha-escala` ou rota equivalente privada.
- Timeline de alteracoes e ciencia.

BFF:

- Rotas explicitas para publications e me.

Aceite:

- Publicacao gera versao imutavel.
- Retificacao preserva historico.
- Colaborador visualiza escala publicada.
- Ciencia fica registrada por usuario, data/hora e versao.

## Fase 4 - Trocas, ausencias, banco de horas e ponto

Objetivo: fechar o ciclo operacional apos a escala publicada.

Trocas:

- Evoluir maquina para `SOLICITADO`, `EM_ANALISE`, `APROVADO_PELO_COLEGA`, `APROVADO_PELO_GESTOR`, `EFETIVADO`, `REJEITADO`, `CANCELADO`.
- Validar cargo, unidade, habilidade, descanso, carga e cobertura.
- Manter endpoints atuais de `schedules/swap-requests`, mas alinhar status e DTOs.

Ausencias:

- Criar fluxo para ferias, atestado, falta, treinamento, curso e outros.
- Integrar com legenda e validacao de rascunho.

Banco de horas:

- `TimeBalancePolicy`
- `TimeBalanceLedger`
- `TimeBalanceEntry`
- `TimeBalanceExpiration`

Ponto web:

- Evoluir `TimeRecord` para entrada, saida, inicio/fim de intervalo.
- Adicionar idempotency key.
- Manter comunicacao clara: nao vender como REP-P completo ate validacao especifica.

Aceite:

- Troca segue duas etapas quando houver colega envolvido.
- Ausencia bloqueia ou alerta escala.
- Banco de horas calcula saldo basico.
- Ponto registra intervalo e divergencia contra escala prevista.

## Fase 5 - Custo, dimensionamento, otimizacao e IA explicavel

Objetivo: criar diferencial de produto e venda consultiva.

Simulacao de custo:

- `ScheduleCostSimulation`
- `PayrollCostAssumption`
- `HeadcountScenario`
- Comparar 6x1, 5x2, 4x3, 12x36 e personalizado.
- Estimar headcount, folha, encargos, provisoes, horas extras e custo incremental.

Diagnostico de horas extras:

- `OvertimeDiagnosis`
- `GutPriorityScore`
- `ActionPlan5W2H`
- Cruzar hora extra com demanda, cobertura, absenteismo, feriados, contrato e gargalos.

Dimensionamento:

- `CoverageDemand`
- `CoverageSnapshot`
- `DailyCapacitySnapshot`
- Comparar necessario x disponivel x escalado.

Otimizacao:

- `ScheduleOptimizationRun`
- `AllocationExplanation`
- `FairnessMetric`
- Greedy balanceado no MVP.
- Depois avaliar min-cost max-flow para maior escala.

IA:

- Usar `AiProviderPort` existente.
- IA sugere e explica; backend valida e efetiva.
- Controlar uso por plano em `AiUsage`.

Paginas:

- `/dashboard/custos`
- `/dashboard/escala/otimizador`
- `/dashboard/escala/risco-fadiga`
- `/dashboard/relatorios/horas-extras`
- `/dashboard/cobertura`

Aceite:

- Simular custo antes de publicar escala.
- Mostrar indicadores de equidade.
- Explicar recomendacoes.
- Nunca efetivar sugestao de IA sem validacao backend e acao humana.

## Ordem recomendada de implementacao

1. Preparar migrations, DTOs, paginacao e indices essenciais.
2. Implementar `LegendCode`, `Holiday` e calendario mensal.
3. Implementar `ScheduleCycle`, rascunho e assignments.
4. Implementar contadores mensais.
5. Implementar templates 5x2, 6x1 e 12x36.
6. Implementar validacoes e alertas.
7. Implementar publicacao/versionamento/ciencia.
8. Implementar portal do colaborador.
9. Evoluir trocas e ausencias.
10. Implementar banco de horas e ponto com intervalo.
11. Implementar simulador de custo.
12. Implementar dimensionamento.
13. Implementar otimizador explicavel e IA.

## Arquitetura de pacotes sugerida no backend

```text
com.escala.authservice.core.scheduling
├── domain
│   ├── calendar
│   ├── holiday
│   ├── legend
│   ├── cycle
│   ├── template
│   ├── validation
│   ├── publication
│   ├── optimization
│   └── cost
├── application
│   ├── MonthlyCalendarService
│   ├── ScheduleDraftService
│   ├── ScheduleTemplateService
│   ├── ScheduleComplianceValidator
│   ├── SchedulePublicationService
│   ├── ScheduleCostSimulationService
│   └── ScheduleOptimizationService
├── port
│   ├── in
│   └── out
└── adapter
    └── persistence
```

Enquanto o projeto ainda mantiver controllers e entidades legadas em pacotes atuais, usar adapters para reduzir acoplamento e migrar incrementalmente.

## Arquitetura de frontend sugerida

```text
Frontend/web-app3/escala/src/
├── features/scheduling
│   ├── api
│   ├── model
│   ├── hooks
│   ├── components
│   └── pages
├── features/time-balance
├── features/check-in
├── features/coverage
└── app/api/bff/scheduling
```

Paginas server-side devem buscar dados iniciais pelo BFF/service e passar para componentes client apenas quando houver interacao.

## Banco de dados

Tabelas novas ou evoluidas:

- `schedule_cycles`
- `schedule_assignments`
- `schedule_versions`
- `schedule_publications`
- `schedule_acknowledgements`
- `schedule_validation_alerts`
- `schedule_templates`
- `schedule_template_patterns`
- `legend_codes`
- `holiday_calendars`
- `holidays`
- `schedule_counter_snapshots`
- `time_balance_policies`
- `time_balance_ledger`
- `coverage_demands`
- `daily_capacity_snapshots`
- `schedule_cost_simulations`
- `schedule_optimization_runs`

Indices minimos:

- `(company_id, year, month, work_unit_id)` em ciclos.
- `(company_id, employee_id, assignment_date)` em assignments.
- `(company_id, cycle_id, severity, status)` em alertas.
- `(company_id, holiday_date, work_unit_id)` em feriados.
- `(company_id, employee_id, record_time_utc desc)` em ponto.

Regra critica:

- Impedir duas escalas ativas para o mesmo colaborador no mesmo dia por constraint parcial quando o modelo definitivo estiver estabilizado.

## Observabilidade e performance

Baseado nos testes JMeter, o estado atual suporta bem carga local pequena/media, mas degrada acima de 100-200 usuarios simultaneos e sob restricao de CPU/memoria.

Antes de homolog:

- OpenTelemetry no backend.
- Correlation id no BFF e backend.
- Prometheus/Grafana com p95/p99 por endpoint.
- Logs estruturados sem dados sensiveis.
- Metricas por endpoint e, quando seguro, por tenant.
- Dashboards para Hikari, Tomcat, PostgreSQL, heap, CPU e filas.

SLO inicial proposto:

- Leituras criticas p95 abaixo de 1s.
- Escritas criticas p95 abaixo de 3s.
- Erros 5xx abaixo de 1%.
- Publicacao de escala mensal em ate 10s no MVP para tenants pequenos.

## Testes

Backend:

- Unitarios para calendario, legendas, feriados, templates, contadores, validacoes, publicacao e custos.
- Integracao para endpoints de scheduling, multi-tenant, JWT, JPA e audit log.
- Concorrencia para criacao/alteracao em lote no mesmo escopo.

Frontend:

- Typecheck/build.
- Testes de componentes principais do grid, wizard e validacao quando a estrutura de testes estiver definida.

Performance:

- Evoluir JMeter para incluir:
  - criar rascunho;
  - aplicar template;
  - validar;
  - publicar;
  - consultar minha escala;
  - consultar dashboard.

## Riscos e mitigacoes

| Risco | Mitigacao |
| --- | --- |
| Complexidade trabalhista por CCT/categoria | Regras parametrizaveis, alertas explicativos e validacao juridica antes de bloqueios fortes. |
| Crescimento de tabelas de ponto/auditoria | Indices por tenant/data, particionamento futuro e retencao definida. |
| UI de grid ficar pesada | Virtualizacao, periodo limitado, DTOs compactos e salvamento em lote idempotente. |
| IA sugerir escala invalida | IA apenas sugere; backend valida e usuario aprova. |
| Vazamento multi-tenant | `company_id` direto, policies no service, testes e futura RLS no PostgreSQL. |
| OpenAPI ficar desatualizado | Checklist obrigatorio em cada PR que altera endpoint REST. |

## MVP recomendado

Escopo minimo para beta fechado:

- Calendario mensal.
- Feriados por tenant/unidade.
- Legendas configuraveis.
- Rascunho mensal.
- Templates 5x2, 6x1 e 12x36.
- Contadores mensais.
- Validacoes basicas.
- Publicacao versionada.
- Portal simples do colaborador.
- Auditoria minima.
- JMeter cobrindo o fluxo principal.

Fora do MVP:

- REP-P completo.
- Otimizador matematico avancado.
- IA efetivando escala.
- Simulacao fiscal/contabil oficial.
- Integracoes de folha.
- WhatsApp/push em producao.

## Proximos passos

1. Abrir PR desta branch com a proposta e documentos de analise.
2. Validar o MVP com produto/juridico/operacao.
3. Escolher entre Flyway e Liquibase.
4. Implementar Fase 0 e Fase 1 em PRs pequenos.
5. Atualizar `OpenApiController`, JMeter e docs a cada etapa funcional.
