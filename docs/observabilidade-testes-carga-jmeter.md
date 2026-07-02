# Observabilidade e testes de carga com JMeter

Data da avaliacao: 2026-06-26.

Atualizacao incremental: 2026-06-28.

## Objetivo

Avaliar se OpenTelemetry, Grafana e uma stack de observabilidade contribuem para a aplicacao Escala, executar testes de carga locais com JMeter e definir expectativas iniciais de usuarios simultaneos, latencia, requisicoes por segundo, throughput e erros.

Esta avaliacao mede o ambiente local atual, nao um limite definitivo de producao. O backend estava rodando em Docker via `spring-boot:run`, PostgreSQL local em Docker e sem frontend/Strapi no caminho da carga. Os numeros abaixo devem ser usados como baseline tecnico para evolucao, nao como capacidade comercial prometida.

## Conclusao executiva

OpenTelemetry, Grafana, Prometheus, Loki e Tempo contribuiriam diretamente para a aplicacao. Hoje existe `spring-boot-starter-actuator`, mas somente `/actuator/health` esta exposto. Nao ha coleta centralizada de metricas, traces distribuidos, logs estruturados pesquisaveis, dashboards de SLO, nem metricas por tenant/empresa.

Limite local observado:

| Cenario | Usuarios simultaneos | Req/s | Latencia media geral | Latencia maxima | Erros |
| --- | ---: | ---: | ---: | ---: | ---: |
| Carga nominal | 25 | 52,11 | 140 ms nas leituras; 1,33s no registro | 2,69s | 0% |
| Stress inicial | 100 | 73,89 | 812-910 ms nas leituras; 3,86s no registro | 10,84s | 0% |
| Stress degradado | 200 | 59,72 | 2,22-2,44s nas leituras; 8,84s no registro | 19,42s | 0% |
| CPU/memoria restritas | 50 com 0,5 CPU e 768 MB | 8,40 | 2,40-2,92s nas leituras; 26,62s no registro | 43,87s | 0% |

Recomendacao de expectativa para o estado atual:

- Trabalhar com ate 50 usuarios simultaneos como zona confortavel no ambiente atual.
- Tratar 100 usuarios simultaneos como limite operacional local ainda aceitavel para leituras simples, mas ja com latencia perceptivel.
- Tratar 200 usuarios simultaneos como ponto de degradacao: sem erro, porem com experiencia ruim.
- Nao usar estes numeros para producao nacional antes de implantar observabilidade, paginacao, cache, pool externo, testes com massa real e topologia de producao.

## Como o teste foi executado

Plano JMeter criado em:

```text
tests/performance/jmeter/escala-load-test.jmx
```

Resultados gerados em:

```text
tests/performance/jmeter/results/
```

Comando base:

```bash
docker run --rm --add-host=host.docker.internal:host-gateway \
  -v /home/wemersonpereirabhs/workspace/pessoal/FullStack:/work \
  -w /work justb4/jmeter:latest \
  -n -t tests/performance/jmeter/escala-load-test.jmx \
  -Jthreads=100 -Jramp=20 -Jduration=90 -JthinkTimeMs=300 \
  -l tests/performance/jmeter/results/escala-load-100u.jtl
```

Fluxo do teste:

1. Cada thread registra uma empresa e usuario temporarios em `POST /api/v1/auth/register`.
2. O JMeter extrai o JWT retornado.
3. A thread repete chamadas autenticadas para:
   - `GET /actuator/health`
   - `GET /api/v1/schedules?year=2026&month=6`
   - `GET /api/v1/employees`
   - `GET /api/v1/schedules/dashboard-summary?year=2026&month=6`

Observacao importante: a primeira versao do plano revelou que `Authorization: Bearer TOKEN_INVALIDO` faz ate o `/actuator/health` retornar erro, porque o filtro JWT tenta parsear token malformado antes de concluir a cadeia de autorizacao. O health publico deve ignorar header `Authorization` invalido ou o filtro deve tratar token malformado como usuario anonimo para rotas publicas.

Atualizacao 2026-06-28:

- O backend foi endurecido para ignorar tokens malformados nas rotas publicas previstas em `JwtAuthenticationFilter`.
- Validacao manual apos o rebuild:
  - `GET /actuator/health` com `Authorization: Bearer TOKEN_INVALIDO` retornou `200 UP`.
  - `POST /api/v1/auth/forgot-password` deixou de expor `resetToken` e `resetUrl` no payload.
- Execucao curta de regressao do JMeter com `10` usuarios, `15s`, `ramp=2`:
  - total `387` amostras, `25,4 req/s`, `0%` de erro.
  - `POST /api/v1/auth/register`: media `423 ms`, max `544 ms`.
  - `GET /actuator/health`: media `16 ms`, max `49 ms`.
  - `GET /api/v1/schedules`: media `74 ms`, max `389 ms`.
  - `GET /api/v1/employees`: media `47 ms`, max `157 ms`.
  - `GET /api/v1/schedules/dashboard-summary`: media `56 ms`, max `138 ms`.

Cobertura atual do plano JMeter:

- O arquivo `tests/performance/jmeter/escala-load-test.jmx` cobre:
  - bootstrap multi-tenant com `register`
  - leituras autenticadas base (`health`, `employees`, `schedules`, `dashboard-summary`)
  - `Escala Operacional` com perfis seed distintos:
    - `admin@escala.local`: `GET /api/v1/escala`, `GET /api/v1/escala/dia`, `GET /api/v1/escala/usuarios`
    - `funcionario@escala.local`: `GET /api/v1/escala/me`

Lacunas remanescentes do plano JMeter:

- Ainda faltam cenarios separados para:
  - `auth/authenticate`, `forgot-password`, `reset-password`, `google`, `complete-registration`
  - `users`, `companies`, `organization`, `work-posts`
  - `escala` CRUD administrativo de escrita (`POST`, `PUT`, `DELETE`)
  - `swap-requests` criacao, aprovacao de colega e decisao final
  - `reports/payroll`, `reports/payroll/export`, `stats/summary`
  - `check-in` com massa e geolocalizacao validas

Achado de regressao observado em runtime em 2026-06-29/30:

- `GET /api/v1/escala/usuarios` e `GET /api/v1/escala/usuarios/{id}` retornaram `403` para o usuario seed `admin@escala.local`, embora `GET /api/v1/escala` e `GET /api/v1/escala/dia` com o mesmo token tenham retornado `200`.
- O plano JMeter passou a incluir esse endpoint justamente para detectar essa regressao de autorizacao sob carga e impedir que ela passe despercebida.

## Resultados detalhados

### 25 usuarios simultaneos

Total: 3.089 amostras em 59,3s. Throughput: 52,11 req/s. Erros: 0%.

| Requisicao | Amostras | Avg | Max | Erro |
| --- | ---: | ---: | ---: | ---: |
| `POST register tenant/user` | 25 | 1327,9 ms | 2692 ms | 0% |
| `GET health` | 775 | 114,8 ms | 841 ms | 0% |
| `GET schedules month` | 771 | 145,6 ms | 1011 ms | 0% |
| `GET employees` | 765 | 119,8 ms | 843 ms | 0% |
| `GET dashboard summary` | 753 | 141,6 ms | 1007 ms | 0% |

### 100 usuarios simultaneos

Total: 6.609 amostras em 89,4s. Throughput: 73,89 req/s. Erros: 0%.

| Requisicao | Amostras | Avg | Max | Erro |
| --- | ---: | ---: | ---: | ---: |
| `POST register tenant/user` | 100 | 3860,8 ms | 10836 ms | 0% |
| `GET health` | 1667 | 812,1 ms | 4441 ms | 0% |
| `GET schedules month` | 1635 | 909,7 ms | 4966 ms | 0% |
| `GET employees` | 1617 | 830,4 ms | 4569 ms | 0% |
| `GET dashboard summary` | 1590 | 907,6 ms | 4103 ms | 0% |

### 200 usuarios simultaneos

Total: 5.352 amostras em 89,6s. Throughput: 59,72 req/s. Erros: 0%.

| Requisicao | Amostras | Avg | Max | Erro |
| --- | ---: | ---: | ---: | ---: |
| `POST register tenant/user` | 200 | 8840,0 ms | 19415 ms | 0% |
| `GET health` | 1363 | 2235,0 ms | 14861 ms | 0% |
| `GET schedules month` | 1317 | 2291,0 ms | 16064 ms | 0% |
| `GET employees` | 1258 | 2221,8 ms | 14305 ms | 0% |
| `GET dashboard summary` | 1214 | 2441,1 ms | 16224 ms | 0% |

### 50 usuarios com CPU/memoria reduzidas

Restricao aplicada temporariamente ao backend:

```bash
docker update --cpus 0.50 --memory 768m --memory-swap 768m escala-backend
```

Total: 499 amostras em 59,4s. Throughput: 8,40 req/s. Erros: 0%.

| Requisicao | Amostras | Avg | Max | Erro |
| --- | ---: | ---: | ---: | ---: |
| `POST register tenant/user` | 50 | 26615,1 ms | 43871 ms | 0% |
| `GET health` | 129 | 2398,9 ms | 5590 ms | 0% |
| `GET schedules month` | 120 | 2920,8 ms | 6796 ms | 0% |
| `GET employees` | 108 | 2402,7 ms | 6688 ms | 0% |
| `GET dashboard summary` | 92 | 2850,5 ms | 7206 ms | 0% |

Comportamento observado: a aplicacao continuou disponivel, mas com latencias inaceitaveis para uso interativo. A memoria do backend ficou proxima do limite (`708 MB / 768 MB`) e o throughput despencou.

## Banco de dados e arquitetura de dados

Pontos positivos atuais:

- PostgreSQL separado para a aplicacao e Strapi no Compose.
- Entidades principais ja possuem `company_id` em varios dominios.
- Existem indices relevantes em `work_shifts`, `messages`, `audit_logs`, `management_*` e `marketing_leads`.
- `spring.jpa.open-in-view=false`, o que ajuda a evitar consultas tardias acidentais na serializacao.

Riscos para escala nacional/multiempresa:

- `spring.jpa.hibernate.ddl-auto=update` ainda esta ativo no profile default. Para producao/homolog deve prevalecer `validate` com migracoes versionadas via Flyway ou Liquibase.
- Muitos endpoints retornam listas sem paginacao ou cursor (`employees`, `users`, `companies`, `messages`, `swap-requests`, organizacao e auditoria). Isso limita crescimento.
- Alguns controllers ainda retornam entidades JPA diretamente. Isso aumenta payload, acopla API ao modelo relacional e pode disparar serializacao pesada.
- Faltam indices compostos por tenant e periodo em tabelas operacionais de maior volume, especialmente ponto, ausencias, trocas e escalas.
- Falta constraint explicita para impedir escala colidindo por funcionario/dia no banco. A regra nao deve depender apenas da aplicacao.
- O pool JDBC default nao esta calibrado no `application.yml`. Em producao, usar Hikari com limites explicitos e PgBouncer em transaction pooling.
- Sem cache para telas quentes como dashboard mensal por `(company_id, year, month)`.
- Sem particionamento ou estrategia de arquivamento para `audit_logs`, `time_records` e historico de escalas.

Arquitetura recomendada para crescer:

- Manter monolito modular por dominio no curto prazo.
- PostgreSQL gerenciado Multi-AZ em producao, com replicas de leitura para relatorios pesados.
- PgBouncer entre aplicacao e banco quando houver multiplas instancias do backend.
- Redis para cache de dashboard, sessoes auxiliares, rate limit e locks curtos de operacoes concorrentes.
- Migracoes versionadas com Flyway ou Liquibase.
- Projecoes/DTOs para leituras de calendario, dashboard e relatorios.
- Paginacao obrigatoria em endpoints administrativos e auditoria.
- Indices por `company_id`, data e status nas tabelas de alto volume.
- Jobs/eventos para auditoria/notificacao fora do caminho sincrono da requisicao.

## Observabilidade recomendada

Stack recomendada:

- OpenTelemetry Java Agent no backend Spring Boot.
- OpenTelemetry instrumentation no Next.js/BFF para correlacionar requisicoes do usuario ate o backend.
- OpenTelemetry Collector como ponto unico de ingestao.
- Prometheus para metricas.
- Grafana para dashboards e alertas.
- Loki para logs estruturados.
- Tempo para traces distribuidos.
- Postgres Exporter para metricas do banco.
- cAdvisor ou Docker/Node exporter para CPU, memoria, rede e IO.

Metricas que devem virar SLO:

- Disponibilidade por rota critica.
- Latencia p50, p95 e p99 por endpoint.
- Taxa de erro 4xx/5xx por endpoint.
- Throughput por endpoint.
- Saturacao de Tomcat threads.
- Hikari active/idle/pending connections.
- Tempo de queries PostgreSQL e locks.
- Tamanho de payload por rota.
- Uso por tenant: requisicoes, IA, check-in, geracao de escalas, exportacao.
- Eventos de negocio: escalas publicadas, trocas solicitadas, check-ins, falhas de regra trabalhista.

Alertas iniciais:

- `5xx > 1%` por 5 minutos.
- `p95 > 1s` em leituras por 10 minutos.
- `p95 > 3s` em escritas por 10 minutos.
- Hikari pending connections maior que zero por 2 minutos.
- CPU backend acima de 80% por 10 minutos.
- Memoria JVM acima de 85% do limite.
- PostgreSQL locks ou conexoes acima de 80% do maximo.
- Disco acima de 80% e WAL crescendo sem checkpoint saudavel.

## Testes de recursos suprimidos

Executado:

- CPU/memoria do backend limitadas para `0,5 CPU` e `768 MB`.
- Resultado: aplicacao permaneceu disponivel, mas a experiencia ficou degradada e throughput caiu de 52-74 req/s para 8,4 req/s.

Nao executado neste ambiente:

- Supressao de disco com preenchimento artificial ou lentidao de volume.
- Perda/degradacao de rede entre backend e PostgreSQL.
- Latencia regional Brasil por origem geografica.
- Falha parcial de PostgreSQL.

Motivo: esses testes podem corromper dados locais ou exigem ferramentas de sistema como `tc/netem`, `stress-ng`, controle de IO por cgroup e ambiente isolado. Devem ser feitos em ambiente efemero com volume descartavel.

Plano recomendado:

- Rede: usar `tc netem` para 50 ms, 100 ms, 200 ms, 2% de perda e jitter entre backend e PostgreSQL.
- Disco: limitar IOPS do volume PostgreSQL e testar writes de check-in/auditoria.
- CPU: repetir testes com 0,5, 1, 2 e 4 vCPU.
- Memoria: repetir com 768 MB, 1 GB, 2 GB e 4 GB.
- Banco: testar PostgreSQL com `max_connections`, shared buffers e pool calibrados.
- Brasil: executar geradores em pelo menos Sao Paulo, Fortaleza/Recife, Manaus e Porto Alegre, medindo latencia real ate a regiao de hospedagem.

## Limites maximos iniciais propostos

Para o estado atual do codigo e ambiente local:

| Nivel | Usuarios simultaneos | Expectativa |
| --- | ---: | --- |
| Confortavel | 25-50 | Leituras abaixo de 300 ms em media e registros abaixo de 2-3s. |
| Aceitavel com atencao | 100 | Leituras perto de 1s em media; precisa observabilidade antes de producao. |
| Degradado | 200 | Sem erro HTTP, mas latencias acima de 2s em media e picos acima de 14s. |
| Restrito por recurso | 50 com 0,5 CPU/768 MB | Disponivel, mas impraticavel para uso interativo. |

Para uma meta de producao nacional inicial, antes de prometer escala maior, a arquitetura deveria mirar:

- 500 usuarios simultaneos por instancia de backend para operacoes leves somente depois de cache, DTOs, paginacao e pool calibrado.
- p95 menor que 500 ms para leituras simples.
- p95 menor que 1,5s para escritas operacionais.
- erro 5xx menor que 0,1% em carga nominal.
- erro total menor que 1%, separando 4xx esperados de falhas reais.

Essas metas precisam ser validadas em infraestrutura semelhante a producao, com massa realista: empresas, funcionarios, escalas mensais, ponto, auditoria e relatorios.

## Proximas acoes recomendadas

1. Expor `/actuator/prometheus` com `micrometer-registry-prometheus`.
2. Adicionar OpenTelemetry Java Agent no backend e collector no Compose.
3. Adicionar Prometheus, Grafana, Loki, Tempo, Postgres Exporter e cAdvisor ao Compose de observabilidade.
4. Corrigir filtro JWT para nao transformar token malformado em erro ruidoso em rotas publicas.
5. Criar massa de teste realista: 100, 1.000 e 10.000 empresas; 20, 100 e 1.000 funcionarios por empresa; escalas de 12 meses; ponto e auditoria.
6. Trocar endpoints de listas por DTOs paginados/cursor.
7. Criar indices e constraints de integridade por tenant/data/status.
8. Repetir JMeter com cenarios separados: login, dashboard, calendario mensal, check-in, geracao de escala, solicitacao/aprovacao de troca e relatorios.
