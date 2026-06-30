# Arquitetura de nuvem para alta demanda

Data: 2026-06-26.

## Objetivo

Definir o cenario mais apropriado para publicar a aplicacao Escala em nuvem, atendendo muitas empresas, usuarios, requisicoes e acoes operacionais em todo o Brasil.

Este documento usa como base:

- O estado atual do produto: Next.js em `Frontend/web-app3/escala`, backend Spring Boot em `Backend/java-app1/demo`, Strapi restrito a CMS e PostgreSQL como banco principal.
- Os testes JMeter documentados em `docs/observabilidade-testes-carga-jmeter.md`.
- A diretriz de evolucao para monolito modular orientado a dominio.
- Documentacao oficial AWS e Azure consultada em 2026-06-26.

## Conclusao recomendada

O cenario mais propicio para a primeira producao robusta e escalavel e:

**AWS como provedor principal, com ECS Fargate para containers, RDS PostgreSQL Multi-AZ, ElastiCache Redis/Valkey, CloudFront, AWS WAF, S3, Secrets Manager, OpenTelemetry Collector, Prometheus/Grafana e logs centralizados.**

Motivos:

- O projeto ja esta naturalmente conteinerizado.
- O backend Spring Boot, o Strapi e jobs futuros rodam bem como servicos separados em ECS Fargate.
- O banco PostgreSQL e o principal gargalo de longo prazo; RDS Multi-AZ, replicas de leitura e PgBouncer resolvem melhor a evolucao inicial sem introduzir Kubernetes cedo demais.
- CloudFront melhora latencia nacional para assets, landing pages, imagens e cache de borda.
- AWS tem caminho direto para WAF, Secrets Manager, CloudWatch, Managed Prometheus e Managed Grafana.
- A operacao fica mais simples que EKS/AKS no inicio e mais controlavel que plataformas excessivamente abstratas quando a aplicacao crescer.

Azure tambem atende bem, principalmente com Azure Container Apps, Azure Database for PostgreSQL Flexible Server, Azure Cache for Redis, Azure Front Door, Application Gateway/WAF e Azure Monitor. A recomendacao, porem, permanece AWS porque os documentos atuais do projeto ja apontam para AWS e a topologia ECS/Fargate + RDS e suficiente para a fase SaaS nacional inicial.

## Resultado dos testes e impacto na arquitetura

Os testes locais mostraram:

| Cenario | Usuarios simultaneos | Req/s | Latencia media | Max | Erros |
| --- | ---: | ---: | ---: | ---: | ---: |
| Nominal local | 25 | 52,11 | 115-146 ms leituras | 2,69s | 0% |
| Stress local | 100 | 73,89 | 812-910 ms leituras | 10,84s | 0% |
| Degradado local | 200 | 59,72 | 2,2-2,4s leituras | 19,42s | 0% |
| Recursos restritos | 50 | 8,40 | 2,4-2,9s leituras | 43,87s | 0% |

Leitura tecnica:

- A aplicacao nao quebrou sob carga, mas degradou a experiencia rapidamente quando subiu a concorrencia.
- A rota de registro/autenticacao pesa mais que leituras simples.
- Com CPU e memoria baixas, a aplicacao permanece viva, mas fica lenta demais.
- Para producao nacional, nao basta subir uma VM maior. E necessario escalar horizontalmente, adicionar cache, paginacao, pool de conexoes, observabilidade e banco gerenciado resiliente.

Meta inicial recomendada para producao:

| Fase | Empresas | Usuarios simultaneos alvo | Req/s alvo | SLO inicial |
| --- | ---: | ---: | ---: | --- |
| MVP produtivo controlado | 50-200 | 100-300 | 100-250 | p95 leitura < 800 ms, erro 5xx < 0,5% |
| SaaS nacional inicial | 500-2.000 | 500-1.500 | 500-1.500 | p95 leitura < 500 ms, p95 escrita < 1,5s, erro 5xx < 0,1% |
| Escala ampla | 5.000+ | 3.000+ | 3.000+ | exige sharding/particionamento, filas e isolamento por plano/tenant |

Essas metas precisam ser validadas em homologacao com massa realista, nao apenas inferidas dos testes locais.

## Arquitetura AWS recomendada

```text
Usuarios Brasil
  -> Route 53
  -> CloudFront + AWS WAF
  -> ALB publico
  -> Subnets privadas de aplicacao
      -> ECS Fargate: frontend Next.js
      -> ECS Fargate: backend Spring Boot
      -> ECS Fargate: Strapi CMS
      -> ECS Fargate: workers/jobs futuros
      -> OpenTelemetry Collector sidecar/servico
  -> Subnets isoladas de dados
      -> RDS PostgreSQL Multi-AZ
      -> PgBouncer
      -> ElastiCache Redis/Valkey
      -> S3 para midias/uploads/backups
  -> Observabilidade
      -> CloudWatch Logs
      -> Amazon Managed Prometheus
      -> Amazon Managed Grafana
      -> Tempo/Loki ou alternativa gerenciada equivalente
```

### Frontend Next.js

Opcao preferencial:

- Rodar o Next.js principal em ECS Fargate quando houver SSR/BFF relevante e necessidade de controlar rede privada ate o backend.
- Colocar CloudFront na frente para cache de assets, imagens, paginas publicas e reducao de latencia.

Opcao alternativa:

- Vercel ou AWS Amplify para o frontend, mantendo o backend em ECS. Essa opcao acelera deploy e edge, mas cria separacao operacional e deve ser avaliada por custo, compliance e controle de rede.

Configuracoes:

- `app.dominio.com.br` para app logado.
- `www.dominio.com.br` para site publico/landing pages.
- `api.dominio.com.br` preferencialmente acessivel somente por ALB/WAF e politicas de CORS estritas.
- `cms.dominio.com.br` protegido por WAF, VPN, allowlist ou SSO administrativo.

### Backend Spring Boot

Rodar em ECS Fargate com:

- Minimo inicial: 2 tasks em zonas diferentes.
- Sizing inicial por task: 2 vCPU e 4 GB RAM para homologacao/performance; ajustar depois por metricas.
- Auto scaling por CPU, memoria, ALB request count e p95 de latencia.
- Health check em `/actuator/health`.
- Deploy rolling ou blue/green.
- Java runtime com limites explicitos de heap, por exemplo `-XX:MaxRAMPercentage=70`.

Recomendacao inicial:

| Ambiente | Tasks min | Tasks max | CPU/task | Memoria/task |
| --- | ---: | ---: | ---: | ---: |
| development cloud | 1 | 2 | 1 vCPU | 2 GB |
| homolog/performance | 2 | 6 | 2 vCPU | 4 GB |
| production inicial | 3 | 12 | 2 vCPU | 4-6 GB |
| production em crescimento | 6 | 30+ | 2-4 vCPU | 6-8 GB |

Nao usar uma unica instancia grande como estrategia principal. Os testes mostraram que restricao de recursos degrada fortemente; a resposta correta e escalar horizontalmente com banco e pool preparados.

### Strapi CMS

Rodar separado do backend:

- ECS Fargate com 1-2 tasks.
- Banco separado no PostgreSQL, como ja previsto.
- Uploads em S3, nao no filesystem do container.
- Admin protegido por WAF, SSO/allowlist e credenciais fortes.
- Cache do conteudo publico via frontend/BFF/CloudFront.

Strapi nao deve ficar no caminho critico de login, ponto, escala ou acoes operacionais.

### PostgreSQL

Usar Amazon RDS PostgreSQL:

- Multi-AZ desde o inicio produtivo.
- Backups automaticos.
- Point-in-time recovery.
- Criptografia em repouso.
- Performance Insights habilitado.
- Parametros calibrados por teste.
- Read replica para relatorios e consultas pesadas assim que dashboards/exports crescerem.

Modelo inicial:

- Shared database/shared schema com `company_id`, como esta sendo adotado.
- Migracoes versionadas com Flyway ou Liquibase.
- `ddl-auto=validate` em homolog/producao.
- Constraints e indices por tenant/data/status.

Quando evoluir:

- Particionar tabelas grandes por periodo, especialmente `time_records`, `audit_logs` e historico de escalas.
- Avaliar isolamento fisico para tenants grandes ou planos enterprise.
- Criar replicas de leitura para relatorios e exports.
- Avaliar arquivamento frio em S3 para auditoria antiga.

Itens obrigatorios antes de carga alta:

- PgBouncer em transaction pooling.
- Hikari com `maximumPoolSize` explicito por instancia.
- Limite de conexoes planejado: `tasks * hikariPool <= conexoes disponiveis no banco/PgBouncer`.
- Queries projetadas/DTOs para calendario, dashboards e relatorios.
- Paginacao/cursor em listas administrativas.

### Redis/Valkey

Usar ElastiCache Redis/Valkey para:

- Cache de dashboard mensal por `(company_id, year, month)`.
- Cache curto de permissoes/escopos do usuario.
- Rate limit de auth, check-in, mensagens, IA e lead.
- Locks curtos para geracao/publicacao de escala.
- Filas leves apenas se a complexidade ainda nao justificar SQS/EventBridge.

Nao usar Redis como banco de verdade. O estado operacional final deve continuar no PostgreSQL.

### Mensageria e jobs

Adicionar SQS/EventBridge quando os fluxos crescerem:

- Envio de email/notificacoes.
- Auditoria enriquecida.
- Processamento de IA.
- Exportacao de relatorios.
- Recalculo de dashboards.
- Recalculo ReBAC/closure.

Regra: operacao secundaria nao deve segurar a transacao principal do usuario.

## Rede e seguranca

Topologia:

- VPC propria.
- 3 Availability Zones quando possivel.
- Subnets publicas: ALB, NAT Gateway quando necessario.
- Subnets privadas: ECS tasks.
- Subnets isoladas: RDS, Redis, PgBouncer.
- Security Groups restritivos por servico.
- Sem IP publico em backend, Strapi e banco.

Seguranca:

- AWS WAF em CloudFront/ALB.
- Rate limit no WAF e tambem na aplicacao para rotas sensiveis.
- Secrets Manager para senhas, JWT secret, Stripe, Google, Recaptcha.
- KMS para criptografia.
- IAM least privilege por task.
- CORS por ambiente.
- HTTPS obrigatorio.
- Logs sem dados sensiveis.

LGPD:

- Dados pessoais com retencao definida.
- Auditoria de acesso e alteracao.
- Mascaramento/tokenizacao para geolocalizacao/device fingerprint se usados como prova trabalhista.
- Backups criptografados.
- Processo de exportacao/exclusao quando juridicamente aplicavel.

## Observabilidade em producao

Obrigatorio antes de abrir para muitos clientes:

- OpenTelemetry Java Agent no Spring Boot.
- Instrumentacao OpenTelemetry no Next.js/BFF.
- OpenTelemetry Collector no ECS.
- Metricas Prometheus.
- Dashboards Grafana.
- Logs estruturados em JSON.
- Correlation ID propagado: frontend -> BFF -> backend -> banco.
- Alertas por SLO.

Dashboards minimos:

- Latencia p50/p95/p99 por endpoint.
- Erros 4xx/5xx por endpoint.
- Throughput por endpoint.
- CPU/memoria por task.
- Tomcat threads.
- Hikari active/idle/pending.
- PostgreSQL conexoes, locks, slow queries, IOPS e CPU.
- Redis hit/miss e memoria.
- Check-ins por minuto.
- Geracoes/publicacoes de escala.
- Solicitacoes/aprovacoes de troca.
- Uso por tenant/plano.

Alertas iniciais:

- `5xx > 0,5%` por 5 minutos.
- `p95 leitura > 800 ms` por 10 minutos.
- `p95 escrita > 1,5s` por 10 minutos.
- Hikari pending connections > 0 por 2 minutos.
- CPU task > 80% por 10 minutos.
- Memoria JVM > 85% por 10 minutos.
- PostgreSQL conexoes > 80%.
- Replica lag relevante em replicas de leitura.
- Disco/WAL acima de limite operacional.

## CI/CD e ambientes

Ambientes:

- `development`: ambiente barato, sem dados reais.
- `homolog`: igual a producao em arquitetura, menor em tamanho.
- `performance`: efemero, com massa sintentica e permissao para testes destrutivos.
- `production`: Multi-AZ, backup, observabilidade e seguranca completas.

Pipeline:

1. Build e testes unitarios.
2. Testes de integracao backend: auth, JWT, JPA, endpoints, serializacao.
3. Build Docker.
4. Scan de imagem.
5. Publicacao no ECR.
6. Deploy em homolog.
7. Smoke tests.
8. JMeter baseline automatizado.
9. Aprovacao manual para producao.
10. Deploy blue/green ou rolling controlado.
11. Validacao de SLO pos-deploy.

Infraestrutura:

- Terraform como padrao.
- Estado remoto e lock.
- Modulos separados: rede, ECS, banco, cache, observabilidade, DNS, secrets.
- Tags obrigatorias de custo: `environment`, `service`, `owner`, `cost-center`.

## Estrategia de escala

### Fase 1: Producao controlada

Objetivo: ate 200 empresas pequenas/medias.

Implementar:

- ECS Fargate com 3 tasks backend.
- RDS PostgreSQL Multi-AZ.
- ElastiCache serverless ou cluster pequeno.
- CloudFront + WAF.
- OpenTelemetry + Grafana.
- PgBouncer.
- S3 para uploads.
- Paginacao nos endpoints mais criticos.

### Fase 2: SaaS nacional inicial

Objetivo: centenas a poucos milhares de empresas.

Implementar:

- Auto scaling agressivo por latencia e requests.
- Read replica para relatorios.
- Cache de dashboard e permissoes.
- Filas para notificacoes, IA e exportacoes.
- Particionamento de `audit_logs` e `time_records`.
- Testes de carga regionais no Brasil.
- Runbooks de incidente.

### Fase 3: Grande escala

Objetivo: milhares de empresas e uso intenso.

Implementar:

- Isolamento de tenants grandes.
- Possivel sharding por tenant/cluster.
- Workers dedicados para relatorios e IA.
- Data lake para historico analitico.
- Feature flags por tenant/plano.
- Multi-region apenas se houver requisito real de continuidade ou latencia extrema.

## AWS vs Azure

| Camada | AWS recomendado | Azure equivalente |
| --- | --- | --- |
| DNS/CDN | Route 53 + CloudFront | Azure DNS + Azure Front Door |
| WAF | AWS WAF | Azure WAF |
| Containers | ECS Fargate | Azure Container Apps ou AKS |
| Registro de imagens | ECR | Azure Container Registry |
| Banco | RDS PostgreSQL Multi-AZ | Azure Database for PostgreSQL Flexible Server HA |
| Cache | ElastiCache Redis/Valkey | Azure Cache for Redis |
| Secrets | Secrets Manager | Azure Key Vault |
| Storage | S3 | Azure Blob Storage |
| Observabilidade | CloudWatch + AMP + AMG + OTel | Azure Monitor + Application Insights + Managed Grafana |
| IaC | Terraform | Terraform |

Escolha recomendada:

- **AWS** para o caminho principal do projeto.
- **Azure** se houver exigencia corporativa, contrato Microsoft, dependencia forte de Entra ID/Power BI/Azure Monitor ou equipe ja madura em Azure.

## Ajustes de codigo antes da producao

Obrigatorios:

- Corrigir filtro JWT para rotas publicas nao falharem com token malformado.
- Expor metricas Prometheus de forma protegida.
- Adicionar DTOs/projecoes em endpoints que hoje retornam entidades JPA.
- Adicionar paginacao/cursor em listas.
- Adicionar Flyway ou Liquibase.
- Trocar `ddl-auto=update` por `validate` em ambientes nao descartaveis.
- Definir Hikari pool por profile.
- Criar constraints para evitar escala duplicada por funcionario/dia.
- Revisar indices por `company_id`, data e status.
- Adicionar rate limit em auth, forgot password, check-in, IA, mensagens e leads.

Recomendados:

- Cache de dashboard mensal.
- Cache de permissoes por sessao curta.
- Filas para notificacao e auditoria secundaria.
- Separar comandos pesados de relatorios/exportacoes.
- Criar massa de teste sintentica realista.

## Testes de carga em homolog/performance

Rodadas minimas:

- 100, 300, 500, 1.000 e 1.500 usuarios simultaneos.
- Duracao minima de 30 minutos por patamar.
- Ramp-up gradual.
- Massa com empresas pequenas, medias e grandes.
- Dados de 12 meses de escala, ponto, auditoria e trocas.
- Testes separados para login, dashboard, calendario, check-in, geracao de escala, troca, aprovacao, relatorio e lead.

Testes de resiliencia:

- Queda de uma task backend.
- Reinicio de task Strapi.
- Failover RDS em janela controlada.
- Redis indisponivel temporariamente.
- Latencia artificial entre app e banco.
- CPU/memoria reduzidas.
- IOPS reduzido no banco.
- Pico nacional simulado em horario comercial.

Critérios de aceite:

- Erro 5xx < 0,1% em carga nominal.
- p95 leitura < 500-800 ms.
- p95 escrita < 1,5s.
- p99 aceitavel e sem caudas acima de 10s em uso normal.
- Banco sem saturacao de conexoes.
- Sem OOM/restart de tasks.
- Auto scaling reagindo sem derrubar sessoes.

## Decisao final

Implementar primeiro na AWS com ECS Fargate + RDS PostgreSQL Multi-AZ + ElastiCache + CloudFront/WAF + OpenTelemetry/Grafana.

Evitar Kubernetes no primeiro momento. EKS/AKS so passa a fazer sentido quando houver necessidade real de orquestracao avancada, multiplos times operando muitos servicos, service mesh, workloads complexos ou padrao corporativo que justifique o custo operacional.

O foco imediato deve ser:

1. Melhorar o codigo para escalabilidade: paginacao, DTOs, indices, pool, cache e migracoes.
2. Implantar observabilidade antes de abrir carga real.
3. Subir homolog/performance parecido com producao.
4. Reexecutar JMeter com massa realista.
5. So entao definir capacidade comercial e limites por plano.

## Fontes oficiais consultadas

- AWS ECS Fargate: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html
- AWS RDS Multi-AZ: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZ.html
- AWS RDS Read Replicas: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html
- Amazon CloudFront: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html
- AWS WAF: https://docs.aws.amazon.com/waf/latest/developerguide/what-is-aws-waf.html
- Amazon ElastiCache: https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html
- Amazon Managed Service for Prometheus: https://docs.aws.amazon.com/prometheus/latest/userguide/what-is-Amazon-Managed-Service-Prometheus.html
- Amazon Managed Grafana: https://docs.aws.amazon.com/grafana/latest/userguide/what-is-Amazon-Managed-Service-Grafana.html
- Azure Container Apps: https://learn.microsoft.com/en-us/azure/container-apps/overview
- Azure Database for PostgreSQL HA: https://learn.microsoft.com/en-us/azure/reliability/reliability-azure-database-postgresql
- Azure Monitor OpenTelemetry/Application Insights: https://learn.microsoft.com/en-us/azure/azure-monitor/app/opentelemetry-overview
