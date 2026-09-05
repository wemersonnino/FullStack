# ADR-006: Infraestrutura minima de producao na AWS

**Status:** Aceito

**Data:** 2026-09-04

**Decisao relacionada:** issue #51 / P0-08

## Contexto e decisao

O `docker-compose.yml` e exclusivamente um ambiente local. A primeira producao do Escala sera implantada em `sa-east-1` (America do Sul/Sao Paulo), com ECS Fargate, ALB, RDS PostgreSQL, ElastiCache para Valkey/Redis, ECR e infraestrutura declarada em Terraform. EC2 com Compose e EKS ficam fora do baseline: o primeiro cria drift e operacao manual; o segundo antecipa complexidade sem necessidade comprovada.

Esta e uma arquitetura compartilhada por tenants. Por isso, banco, cache e workloads nao recebem IP publico, e um erro de rede ou IAM e tratado como evento de alto blast radius. A estrategia de segredos e complementar e esta definida na [ADR-005](adr-005-secrets-producao-aws.md).

A matriz normativa de endpoints publicos, servicos internos, diagnostico sem SSH e testes de bloqueio fica na [ADR-007](adr-007-exposicao-servicos-producao.md).

## Diagrama do baseline

```text
Internet
  -> Route 53 (www, app, api, cms, assets)
  -> CloudFront + AWS WAF + ACM (TLS publico)
  -> ALB publico, somente HTTPS/443
       -> ECS Fargate frontend (Next.js/BFF, privado)
       -> ECS Fargate backend (Spring Boot, privado)
       -> ECS Fargate Strapi (privado; admin por VPN/SSO/allowlist)
  -> sub-redes privadas de dados
       -> RDS PostgreSQL Multi-AZ (sem acesso publico)
       -> ElastiCache Valkey/Redis (sem acesso publico)
       -> S3 (midias e backups logicos, por endpoint privado quando aplicavel)

ECR -> task definitions imutaveis -> ECS rolling/blue-green
CloudWatch/CloudTrail/OTel recebem logs, metricas e auditoria
```

## Rede e entrada

- Uma VPC exclusiva por ambiente, com CIDR reservado por IaC (referencia: `/16`); development-cloud, homologacao e producao nunca compartilham VPC, contas ou peering implicito.
- Tres AZs quando disponiveis: uma subnet publica e uma privada de aplicacao por AZ; RDS/ElastiCache usam subnets privadas de dados em pelo menos duas AZs. O plano Terraform deve validar CIDRs sem sobreposicao antes de aplicar.
- Somente o ALB tem subnets publicas. Tasks ECS, RDS, ElastiCache e endpoints de administracao nao recebem IP publico.
- Route 53 aponta os dominios publicos para CloudFront/ALB. ACM termina TLS no CloudFront e ALB; redirecionar HTTP/80 para HTTPS/443, exigir TLS 1.2 ou superior e habilitar HSTS no frontend.
- `www` e `app` sao os unicos hosts publicos normais. `api` e servido por ALB/WAF com CORS estrito e preferencialmente consumido pelo BFF. `cms` nao recebe rota publica administrativa: requer VPN, SSO ou allowlist aprovada. `assets` e CloudFront/S3, sem listagem de bucket.
- NAT Gateway e necessario apenas para saidas controladas de tasks privadas. Produção usa um por AZ para disponibilidade; homologacao pode usar um unico NAT explicitamente aceitando o risco. Criar endpoints VPC para S3, ECR, CloudWatch e Secrets Manager quando aplicavel, reduzindo custo e trafego pelo NAT.

## Matriz de Security Groups

| Destino | Entrada permitida | Saida necessaria | Proibido |
| --- | --- | --- | --- |
| ALB | Internet/CloudFront: `443`; `80` apenas para redirect | frontend `3000`, backend `8080` | SSH, banco, Redis |
| Frontend ECS | somente SG do ALB em `3000` | backend `8080`, Strapi `1337`, Redis se requerido, AWS endpoints | Internet direta, RDS direta |
| Backend ECS | somente SG do ALB/BFF em `8080` | RDS `5432`, Redis `6379`, Strapi `1337`, AWS endpoints | Internet direta, SSH |
| Strapi ECS | somente backend/BFF e caminho administrativo aprovado em `1337` | RDS `5432`, S3, AWS endpoints | Internet direta, Redis sem justificativa |
| RDS | SG backend e SG de migracao temporario em `5432` | apenas respostas | ALB, Internet, SG frontend |
| ElastiCache | SG backend e, se justificado, frontend/BFF em `6379` | apenas respostas | Internet, ALB, acesso humano |

Security Groups usam referencias a outros SGs, nunca CIDRs amplos entre servicos. Network ACLs permanecem simples e estatais via SGs; qualquer excecao deve ser registrada e expirar. IAM segue menor privilegio por execution role, task role, CI e operador; nenhuma role de workload recebe `AdministratorAccess`.

## Compute, dados e imagens

- ECS cluster por ambiente, services separados para frontend, backend e Strapi. Mínimo produtivo: duas tasks de frontend e backend distribuídas em AZs; Strapi inicia com uma task, com plano de segunda task apos validar armazenamento compartilhado/externo. Workers usam service/queue separados quando existirem.
- ECR e a unica origem de imagens de producao. Cada build publica digest e tags rastreaveis (`git-<sha>` e release); task definitions referenciam **digest**, nao `latest` nem tag mutavel. Ativar scan de imagem e reter apenas imagens conforme politica de rollback/auditoria.
- RDS PostgreSQL e ElastiCache usam encryption at rest com KMS, backups e manutencao gerenciados. RDS inicia Multi-AZ, backup automatico e point-in-time recovery; Redis/Valkey usa subnet group privado, auth/TLS quando suportado e backup conforme criticidade.
- Credenciais entram somente no runtime via Secrets Manager/SSM conforme ADR-005. Nenhum secret entra no Dockerfile, ECR, task definition, log ou artefato CI.

## Deploy, validacao e rollback

1. CI cria imagem, executa testes/scan, publica o digest no ECR e registra SBOM/proveniencia quando o pipeline suportar.
2. Terraform aplica somente a infraestrutura revisada; deploy registra task definition com os digests exatos em homologacao.
3. ECS faz rolling controlado ou blue/green: healthchecks exigem `/actuator/health` no backend, `/api/auth/session` no frontend e `/admin` no Strapi. ALB so recebe targets saudaveis.
4. Smoke tests confirmam TLS, DNS, caminhos ALB autorizados, login/BFF, OpenAPI restrito, conexao de dados, ausencia de acesso publico a RDS/Redis e logs sem secrets.
5. Promocao para producao requer aprovacao, alerta/metricas estaveis e plano de rollback preenchido.

O rollback e alterar a task definition para o **digest estavel anterior** e aguardar o healthcheck; ele nao recria RDS, Redis, volumes ou dados. Migrations devem ser aditivas/compatíveis por ao menos uma versao. Se houver migracao irreversivel, o deploy exige backup/PITR validado e runbook especifico; nao executar `down` automatico em producao.

## Testes de aceite de infraestrutura

- Um teste de conectividade por SG comprova permitido e negado: Internet -> ALB 443 permitido; Internet -> ECS/RDS/Redis e negado; frontend -> RDS negado; backend -> RDS/Redis permitido.
- Scanner externo confirma somente 443 publico; TLS, certificado ACM e redirect HTTP sao validados em cada dominio publicado.
- Deploy de digest novo e rollback ao digest anterior sao ensaiados em homologacao sem alterar dados persistentes.
- Restart de task backend/Strapi e failover RDS em janela controlada comprovam recovery e healthchecks.
- CloudTrail, CloudWatch e alarmes de target unhealthy, erros 5xx, conexoes RDS e memoria Redis sao revisados antes de go-live.

## Estimativa inicial de custo

Referência de planejamento para `sa-east-1`, 30 dias, producao controlada, sem impostos, suporte AWS, transferencia de Internet, WAF por regra/requisicao, backups excedentes ou custos de incidentes:

| Componente | Premissa inicial | Faixa mensal USD |
| --- | --- | ---: |
| ECS/Fargate | 2 frontend + 2 backend + 1 Strapi, tamanho inicial conservador | 180-450 |
| RDS PostgreSQL Multi-AZ | instancia pequena/media, storage e backup base | 250-650 |
| ElastiCache | Valkey/Redis pequeno privado | 50-180 |
| ALB, CloudFront, Route 53, logs e ECR | baixo trafego inicial | 80-250 |
| NAT Gateway | dois NATs e trafego baixo; principal custo de rede fixo | 350-650 |
| **Total de referencia** | antes de egress, impostos e suporte | **910-2.180** |

Os valores sao faixa de orçamento, nao cotacao. Antes do provisionamento, plataforma deve salvar uma estimativa da AWS Pricing Calculator com região, tamanhos, trafego, retencao de logs, transferencias e impostos do periodo. Fargate cobra por vCPU/memoria solicitadas e NAT cobra por hora e dados processados; endpoints VPC e dimensionamento real devem reduzir o custo de NAT quando possivel. Fontes consultadas em 2026-09-04: [Fargate](https://aws.amazon.com/pt/fargate/pricing/), [VPC/NAT](https://aws.amazon.com/pt/vpc/pricing/), [ElastiCache](https://aws.amazon.com/pt/elasticache/pricing/) e [AWS Pricing Calculator](https://calculator.aws/).

## Consequencias

O baseline aumenta custo fixo e exige Terraform, revisao de IAM e runbooks, mas elimina exposição pública de dados, reduz drift e permite rollback de aplicação sem tocar em dados persistentes. EKS, multi-regiao, replicas de leitura e autoscaling avançado ficam para fases posteriores, guiadas por SLO/carga reais.
