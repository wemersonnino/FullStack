# Analise senior de seguranca, dados, produto e marketing

Data: 2026-06-24

## Escopo

Esta analise considera o backend oficial `Backend/java-app1/demo`, o frontend principal `Frontend/web-app3/escala`, o CMS `Backend/cms-strapi` e a diretriz de produto para uma plataforma multiempresa de escalas, ponto, trocas, hierarquia de gestores, mensageria, IA e marketing.

## Diretriz arquitetural obrigatoria

- Backend e frontend devem seguir arquitetura hexagonal.
- Regras de negocio ficam em `domain/model` e casos de uso em `application/services`.
- Adapters fazem a comunicacao com BFF, HTTP, banco, Strapi ou integrações externas.
- `page.tsx` no App Router deve ser server-side por padrao: autentica, chama service/adapter/BFF, recebe dados e repassa para componentes filhos.
- Componentes de UI devem ser burros: renderizam dados, coletam input e disparam eventos. Nao devem conter regra de negocio, autorizacao, transformacao de dominio ou fetch direto para endpoints.
- Componentes client sao permitidos apenas para interacao inevitavel, como modal, input, select, optimistic UI e refresh, chamando services/casos de uso do frontend.
- Zustand deve gerenciar estado de UI transversal ou modal/interacao; nao deve virar repositorio de regra de negocio.

## Diagnostico executivo

O projeto ja tem uma base boa para evoluir: isolamento por empresa em varias consultas, `@Version` em `WorkShift`, unique constraint para impedir escala duplicada por funcionario/data, BFF no Next.js e Swagger manual. Os maiores riscos para uso real por varias empresas sao:

- O modelo multi-tenant ainda depende de disciplina no codigo, nao de uma barreira estrutural do banco.
- `TimeRecord` nao possui `company_id` direto, indice temporal/tenant e chave de idempotencia para batidas simultaneas.
- O ReBAC de gestores ainda esta simplificado em `Sector.manager`; falta arvore/escopo formal.
- A maquina de estados de troca no banco usa `PENDING/APPROVED/...`, divergente do fluxo alvo em portugues.
- Faltam paginacao, cursor e limites em endpoints que podem crescer muito.
- CORS, secrets, headers de seguranca, auditoria e LGPD precisam ser endurecidos antes de nuvem.
- A home estava caindo em fallback porque a API local do Strapi retornou `data: []` para `landing-pages`; o seed parcial nao criava landing pages ausentes.

## Seguranca da informacao

Prioridade alta:

- Tornar `company_id` obrigatorio em todas as entidades operacionais: `users`, `employees`, `work_shifts`, `shift_swap_requests`, `time_records`, `messages`, `audit_logs`, `operational_capacities`.
- Aplicar defesa em profundidade no PostgreSQL com Row Level Security por tenant quando entrar em homolog/producao. O backend deve setar `app.current_company_id` por transacao e as policies bloquearem vazamento entre empresas.
- Trocar CORS fixo por variavel de ambiente: `APP_ALLOWED_ORIGINS=https://...`.
- Proteger Swagger em homolog/producao: manter publico apenas localmente ou exigir role tecnica.
- Implementar rate limit para `auth`, `forgot-password`, `check-in`, `messages` e `ai`.
- JWT: usar segredo forte via secret manager, rotacao planejada, `issuer`, `audience`, expiracao curta e refresh token com armazenamento revogavel.
- Login: resposta externa deve continuar generica para evitar enumeracao de usuarios; UI pode mostrar "e-mail ou senha incorretos" sem dizer se o e-mail existe.
- Dados sensiveis: criptografar ou tokenizar campos de geolocalizacao/dispositivo se forem usados para prova trabalhista; limitar retencao.
- Auditoria append-only: evitar update/delete fisico de logs; registrar actor, tenant, IP, user-agent, before/after e correlation id.

## Transito dos dados

- Produção deve aceitar apenas HTTPS/TLS 1.2+.
- Backend, frontend e Strapi em nuvem devem se comunicar por rede privada quando possivel.
- HSTS, CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` no frontend.
- Webhooks externos, como Stripe e futuros CRM, devem validar assinatura e replay window.
- Check-in mobile/web deve mandar `idempotencyKey`, timestamp do dispositivo, timestamp do servidor, coordenadas opcionais e origem do dado.

## Armazenamento e modelagem DBA

Modelo recomendado para ACID e normalizacao:

- 1NF: remover listas em colunas operacionais; datas de escala devem virar linhas em `work_shifts`, como ja ocorre.
- 2NF/3NF: setor, projeto, posto, equipe e gestor devem ser tabelas independentes, nao textos redundantes na escala. Os campos textuais de `EscalaRequest` podem ser aceitos na API, mas persistencia deve referenciar IDs.
- Multi-tenant: usar `company_id` direto nas tabelas grandes para simplificar indices e policies, mesmo quando dedutivel por joins.
- Soft delete: `deleted_at`, `deleted_by`, `delete_reason` em entidades relevantes; filtros padrao devem ignorar deletados.
- Ponto: `time_records` deve ser append-only, com `company_id`, `employee_id`, `work_shift_id` opcional, `record_time_utc`, `timezone`, `type`, `source`, `idempotency_key`, coordenadas e metadados.

Indices recomendados:

```sql
-- escalas administrativas por empresa/periodo
create index idx_work_shifts_company_date
  on work_shifts (company_id, shift_date, status, start_time);

-- calendario por funcionario
create unique index uk_work_shifts_company_employee_date_active
  on work_shifts (company_id, employee_id, shift_date)
  where status <> 'CANCELLED' and deleted_at is null;

-- capacidade por setor/posto
create index idx_work_shifts_capacity_lookup
  on work_shifts (company_id, sector_id, project_id, work_post_id, shift_date, work_mode, status);

-- ponto por empresa e funcionario
create index idx_time_records_company_employee_time
  on time_records (company_id, employee_id, record_time_utc desc);

-- idempotencia de batida
create unique index uk_time_records_company_idempotency
  on time_records (company_id, idempotency_key);

-- trocas pendentes por tenant
create index idx_swap_requests_company_status_created
  on shift_swap_requests (company_id, status, created_at desc);

-- mensagens/inbox
create index idx_messages_receiver_status_created
  on messages (company_id, receiver_id, status, created_at desc);
```

PostgreSQL em escala:

- Particionar `time_records`, `audit_logs` e futuramente `messages` por mes, com subparticionamento logico por `company_id` se necessario.
- Usar `BRIN` em tabelas append-only muito grandes por timestamp e `BTREE` para consultas tenant+periodo.
- Considerar PostGIS para geofencing real: `geography(Point, 4326)` com indice GiST.
- Procedures/triggers fazem sentido para invariantes criticas e auditoria append-only, nao para regra de negocio complexa. Exemplo valido: bloquear update/delete fisico de `audit_logs` e garantir `updated_at`.
- Para escala, preferir transacoes no service + constraints + locks. Trigger para capacidade maxima pode ser dificil de manter quando a regra depende de setor, projeto, posto e modalidade.

## Concorrencia e consistencia

Problema real: varios gestores tentando alterar a escala do mesmo setor/posto/dia.

Estratégia recomendada:

- Manter optimistic locking por escala (`@Version`) para edicoes individuais.
- Adicionar lock transacional por escopo operacional para criacao em lote:
  - chave: `(company_id, sector_id|work_post_id|project_id, shift_date)`;
  - implementar inicialmente com `pg_advisory_xact_lock(hash(...))`;
  - evoluir para tabela `schedule_locks` se precisar mostrar lock na UI.
- Unique partial index impede colisao de funcionario/dia.
- Capacidade minima/maxima deve ser validada dentro da mesma transacao da criacao/alteracao.
- Operacoes em lote devem ser idempotentes com `operation_id`.

## ReBAC Jethro

Papeis globais por tenant:

- `OWNER`: dono do tenant.
- `ADMIN`: TI/permissoes.
- `MANAGER_DIRETOR`: peso 1000.
- `MANAGER_GERENTE`: peso 100.
- `MANAGER_COORDENADOR`: peso 50.
- `MANAGER_SUPERVISOR`: peso 10.

Estrutura de dados recomendada:

```text
manager_assignments
- id
- company_id
- manager_user_id
- scope_type: COMPANY | SECTOR | PROJECT | WORK_POST | TEAM | EMPLOYEE
- scope_id
- role_level
- level_weight
- starts_at
- ends_at
- active

management_edges
- company_id
- parent_user_id
- child_user_id
- relation_type
- starts_at
- ends_at

management_closure
- company_id
- ancestor_user_id
- descendant_user_id
- depth
- max_weight_path
```

Algoritmo de autorizacao:

1. Resolver tenant do usuario autenticado.
2. `OWNER/ADMIN` tem escopo administrativo completo no tenant.
3. Para gestor, buscar escopos ativos em `manager_assignments`.
4. Verificar se o recurso pertence a um dos escopos ou a um descendente na `management_closure`.
5. Comparar peso do papel: gestor so altera recursos abaixo do seu nivel ou no escopo explicitamente atribuido.
6. Registrar decisao no audit log com policy aplicada.

Complexidade:

- Consulta de permissao com closure table: `O(log n)` por indice composto.
- Atualizacao de hierarquia: mais cara, mas rara; pode recalcular closure em transacao.
- Para UI, cachear escopos do usuario por sessao curta e invalidar quando `manager_assignments` mudar.

Estado implementado:

- Criadas entidades JPA `ManagerAssignment`, `ManagementEdge` e `ManagementClosure`.
- Criados enums `ManagerScopeType` e `ManagerRoleLevel` com pesos do modelo Jethro.
- Criados repositories para as novas tabelas.
- Criado `PolicyService` para centralizar regra de autorização de escala.
- `ScheduleService` passou a usar `PolicyService` nos fluxos de listagem, criação, alteração, cancelamento e usuários escaláveis.
- Compatibilidade mantida com `Sector.manager` como fallback enquanto as novas tabelas ainda não têm dados.

Pendente:

- Criar endpoints administrativos para `OWNER`/`ADMIN` cadastrarem `manager_assignments`, `management_edges` e recalcularem `management_closure`.
- Adicionar testes de integração para políticas ReBAC.
- Migrar `OrganizationService`, `MessageService` e demais módulos para o mesmo `PolicyService`.

## Algoritmos de escala e performance

Para geracao mensal/anual:

- Pequeno volume: greedy balanceado por funcionario ativo, evitando dias consecutivos e respeitando indisponibilidades.
- Medio volume: scoring function por candidato:
  - penalidade por horas acumuladas;
  - penalidade por dia consecutivo;
  - penalidade por distancia/local;
  - bonus por competencia/setor;
  - bloqueio por ferias/licenca/atestados.
- Grande volume: min-cost max-flow por dia/setor/posto, onde funcionarios sao oferta, turnos sao demanda e o custo representa injustica/risco.
- Para hospitais/seguranca 24x7: usar otimizador em job assíncrono, salvar proposta e exigir aprovacao humana.

Para consulta:

- Endpoints de calendario devem aceitar periodo limitado e paginacao/cursor.
- Cachear dashboard summary por `(company_id, year, month)` e invalidar por eventos de escala/ponto.
- Usar projections/DTO queries para telas; evitar retornar entidades JPA diretamente.
- Precalcular contadores diarios de capacidade em tabela `daily_capacity_snapshot` quando o volume crescer.

Para insercao/remocao:

- Insercao em lote com transacao unica e flush controlado.
- Soft delete para escala vira status `CANCELLED` + audit event.
- Ponto deve ser append-only; correcao de ponto deve gerar evento de ajuste, nao alterar batida original.

## Nuvem

AWS:

- ECS/Fargate ou EKS para frontend/backend/Strapi; RDS PostgreSQL Multi-AZ; ElastiCache Redis; S3 para uploads; Secrets Manager; CloudFront/WAF.

Azure:

- Container Apps ou AKS; Azure Database for PostgreSQL Flexible Server; Blob Storage; Key Vault; Front Door/WAF.

Google Cloud:

- Cloud Run ou GKE; Cloud SQL PostgreSQL; Cloud Storage; Secret Manager; Cloud Armor.

Padrao comum:

- Observabilidade com logs estruturados, tracing OpenTelemetry e metricas por tenant.
- Backups automatizados, PITR, replicas de leitura e plano de restore testado.
- CI/CD com migrations versionadas, testes de contrato e smoke test pos-deploy.

## UX, UI e produto

Prioridades de experiência:

- Gestor deve enxergar conflito antes de salvar: capacidade, cobertura minima, indisponibilidade e colisao por funcionario.
- `Nova Escala` deve evoluir para wizard: escopo -> funcionarios/grupo -> datas/turnos -> validacao -> confirmacao.
- Trocas devem ter timeline: solicitado, aceite do colega, aprovacao gestor, efetivado/rejeitado.
- Relatorios devem permitir CSV imediatamente e evoluir para PDF/XLSX assíncrono.
- IA deve ser assistente operacional, nao oraculo: sempre mostrar base da recomendacao e acao sugerida.
- Mensageria precisa de inbox por contexto: colaborador, gestor, equipe, setor/posto/projeto e permissoes.

## Marketing e concorrencia

Concorrente analisado: Deputy. O site oficial posiciona o produto como plataforma de pessoas para trabalho horista, com scheduling, timekeeping, compliance, HR, payroll, communication e AI. Tambem destaca multi-location, franchise, enterprise, compliance, integrações, API, trust center e industrias como healthcare, retail, security e hospitality.

Fonte: https://www.deputy.com/

SWOT comparativo:

- Forcas do Escala: foco Brasil/LGPD/Portaria 671, Strapi para marketing, arquitetura BFF, dominios de escala e IA ja iniciados, potencial de ReBAC por setor/posto.
- Fraquezas: produto ainda incompleto na UI, dados operacionais sem tenant direto em todas as tabelas, pouca cobertura de integracao/JPA/security, marca e prova social ainda fracas.
- Oportunidades: nichos brasileiros de saude, seguranca, facilities e operacoes distribuídas; compliance local; novo CNPJ alfanumerico; IA aplicada a cobertura operacional.
- Ameacas: players maduros com apps mobile, payroll, integrações, marketplace, reputacao e trust center; custo de IA; complexidade trabalhista por região.

Oceano Azul:

- Reduzir: complexidade de configuracao e dependencia de planilhas.
- Eliminar: troca informal por WhatsApp sem trilha de auditoria.
- Elevar: compliance local, prova de presenca, explicabilidade de escala e rastreabilidade.
- Criar: ReBAC operacional por posto/setor/equipe, assistente IA de risco trabalhista, capacidade minima configuravel pelo gestor e cockpit de cobertura presencial.

4 Ps:

- Produto: gestão de escala, ponto, trocas, capacidade, mensageria, auditoria, IA e CMS de campanhas.
- Preco: planos por colaborador/mês com mínimo por empresa; IA por créditos; plano enterprise com implantação assistida.
- Praça: SaaS web primeiro, mobile/pwa para ponto, venda inbound por conteúdo e outbound para saúde/segurança/facilities.
- Promoção: campanhas por segmento, demo orientada a operação, calculadora de horas extras, prova de compliance e conteúdos Strapi com UTM/consentimento.

## Strapi e home

Resultado local observado:

- `GET /api/landing-pages?locale=pt-BR&...&filters[pageKey][$eq]=home` retornou `data: []`.
- `GET /api/landing-pages?locale=pt-BR&publicationState=preview&populate=*` retornou `data: []`.
- Ha conteudo em `Backend/cms-strapi/data/marketing-content-v3.json`, mas a instancia local nao estava retornando landing pages pela API.

Correcao aplicada:

- `scripts/ensure-marketing-content.js` agora cria landing pages ausentes de forma nao destrutiva antes de sincronizar relacoes.

Proximo passo:

- Reiniciar Strapi ou aguardar cron; se ainda retornar vazio, executar com `STRAPI_FORCE_MARKETING_SEED=true` em ambiente local controlado.

## Plano de implementacao

Fase 1 - Produto funcional e seguranca basica:

- Finalizar UI de Nova Escala com setores/projetos/postos reais e validacao visual.
- Finalizar Trocas com aceite do colega, decisao final e timeline.
- Relatorios: CSV pronto, XLSX/PDF por job assíncrono.
- IA: prompt livre, historico e limites por tenant.
- CORS por ambiente, rate limit e Swagger protegido fora de local.

Fase 2 - Dados e ReBAC:

- Criar migration para `company_id` direto nas tabelas grandes.
- Implementar `manager_assignments`, `management_edges`, `management_closure`.
- Trocar checks `ADMIN/MANAGER/OWNER` por policy service.
- Migrar status de troca para maquina alvo.
- Adicionar indices e unique partial indexes.

Fase 3 - Escala em alto volume:

- Locks por escopo/dia.
- Geração assíncrona mensal/anual.
- Snapshot de capacidade diaria.
- Paginacao/cursor em calendarios e mensagens.
- Testes concorrentes com múltiplos tenants.

Fase 4 - Nuvem e operação:

- Terraform/IaC.
- RDS/Cloud SQL com PITR.
- Object storage para uploads.
- Observabilidade e alertas.
- Pipeline com migrations, testes e smoke tests.

Fase 5 - Growth:

- Integracao Strapi -> backend marketing leads -> CRM.
- UTM, consentimento e eventos de campanha.
- Páginas por segmento: saude, seguranca, facilities, varejo.
- Trust center, politicas de segurança e status page.
