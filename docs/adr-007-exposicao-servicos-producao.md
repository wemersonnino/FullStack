# ADR-007: Bloqueio de exposicao de servicos internos em producao

**Status:** Aceito

**Data:** 2026-09-04

**Decisao relacionada:** issue #57 / P0-14

## Contexto e decisao

As portas publicadas pelo `docker-compose.yml` existem para desenvolvimento local e nao definem o perimetro de producao. Em AWS, o padrao e **default deny**: nenhum workload, banco, cache ou interface administrativa recebe IP publico ou regra de Security Group (SG) de entrada ate que um fluxo de negocio documentado o justifique.

A arquitetura de rede da [ADR-006](adr-006-infraestrutura-minima-producao-aws.md) permanece a base. Esta decisao a torna executavel ao definir quais hosts, caminhos e portas podem cruzar o ingresso, e como administrar workloads sem abrir SSH, PostgreSQL, Redis ou Strapi permanentemente.

## Matriz de exposicao

| Componente ou rota | Exposicao em producao | Caminho permitido | Controles obrigatorios |
| --- | --- | --- | --- |
| `www.*` e `app.*` | publica, somente `443` | Internet -> CloudFront/WAF -> ALB -> frontend Next.js | ACM/TLS, WAF, HSTS, rate limit, logs de acesso |
| API operacional Spring Boot | interna por padrao | frontend/BFF -> backend ECS em `8080` | SG por referencia; sem listener/host publico generico |
| Webhook Stripe | publico somente no path documentado | Stripe -> WAF/ALB `api.*` -> backend | TLS, assinatura Stripe, allowlist de rota/metodo, rate limit e logs sem payload sensivel |
| Callback Google/OAuth | publico somente no callback registrado | navegador/provedor -> frontend/BFF `443` | redirect URI exata, state/nonce, TLS e CORS/origin corretos |
| Conteudo editorial Strapi | privado por padrao; publicacao apenas se necessaria | backend/BFF -> Strapi `1337`; alternativa CloudFront com rota de leitura estrita | token de leitura, cache, sem admin no mesmo path publico |
| Strapi Admin | nunca publico diretamente | operador -> SSO/VPN/allowlist aprovada -> ALB interno/Strapi | MFA, RBAC, auditoria e janela de acesso |
| Swagger/OpenAPI | local; fora dele somente acesso administrativo aprovado | VPN/SSO -> ALB interno -> backend | sem rota publica, autenticacao e logs |
| `/actuator/health` | interno | ALB target group -> backend | healthcheck por SG; nao publicar host/path na borda |
| PostgreSQL `5432` | interno | backend ou migration role -> RDS | RDS `PubliclyAccessible=false`, SG de origem exato, TLS quando configurado |
| Redis/Valkey `6379` | interno | backend/BFF justificado -> ElastiCache | sem IP publico, SG de origem exato, auth/TLS quando suportado |

`api.*` nao significa que toda a API Spring Boot fica publica. O ALB usa regras por host e caminho com default action `fixed-response 404`; somente callbacks externos explicitamente aprovados recebem encaminhamento ao target backend. Os fluxos normais de browser usam o BFF do Next.js. Novas excecoes exigem dono, justificativa, metodo HTTP, path, autenticacao, limites e teste de bloqueio.

## Regras de implementacao na AWS

- ALB e CloudFront sao os unicos componentes de entrada publica. Tasks ECS usam subnets privadas e `assign_public_ip = false`; RDS e ElastiCache usam subnet groups privados e nao possuem endpoint publico.
- SG do ALB aceita `443` da Internet/CloudFront; `80` serve exclusivamente para redirect a HTTPS. Nao liberar `22`, `1337`, `3000`, `5432`, `6379` ou `8080` da Internet.
- SG do frontend aceita `3000` somente do SG do ALB. SG do backend aceita `8080` somente do SG frontend e, quando houver webhook aprovado, do SG/target group do ALB dedicado. SG do Strapi aceita `1337` somente do backend/BFF e do caminho administrativo interno.
- SG do RDS aceita `5432` apenas do SG backend e de um SG de migracao temporario. SG do ElastiCache aceita `6379` apenas do SG backend/BFF explicitamente autorizado. Nunca usar `0.0.0.0/0`, CIDR corporativo amplo ou porta publica como atalho operacional.
- Route tables de subnets de dados nao apontam para Internet Gateway ou NAT para entrada. NAT e endpoints VPC existem apenas para saidas requeridas de workloads privados.
- Task definitions nao publicam portas no host. O mapeamento de porta fica restrito ao target group/SG; imagens e configuracoes de runtime nao podem recriar a exposicao do Compose local.
- Terraform deve expressar cada listener rule, SG, `publicly_accessible`, subnet group e `assign_public_ip`; revisao de plano e policy-as-code falham para regras abertas proibidas.

## Diagnostico e administracao sem portas permanentes

- Operadores usam AWS IAM Identity Center com MFA e papeis temporarios. Investigar logs e metricas por CloudWatch/CloudTrail primeiro.
- Para shell ou diagnostico excepcional de task, usar ECS Exec com logging/auditoria e policy IAM de menor privilegio. Para instancias gerenciadas futuras, usar SSM Session Manager; nao criar bastion ou SSH publico por conveniencia.
- Acesso a banco ocorre por ferramenta aprovada atraves de tunel temporario SSM/VPN e role de curta duracao, com auditoria. Credenciais seguem ADR-005 e nao sao copiadas para estações ou tickets.
- Uma excecao emergencial de SG deve ter ticket/incidente, origem e porta minimas, expiracao automatica, aprovacao e revisao posterior. Ela nao substitui uma rota de produto.

## Testes de aceite e observabilidade

Antes do go-live e a cada mudanca de rede, executar em homologacao e registrar evidencias:

1. Varredura externa aprovada confirma somente `443` publicado; `3000`, `8080`, `1337`, `5432` e `6379` nao respondem da Internet.
2. Testes de rota confirmam `www/app` e callbacks aprovados; caminhos API nao autorizados retornam `404`/`403` no WAF/ALB sem atingir o backend.
3. Healthcheck do target group alcança `/actuator/health` internamente; tentativa externa ao mesmo path e host nao encontra rota publica.
4. Testes de conectividade por SG confirmam backend -> RDS/Redis permitido, frontend -> RDS negado, Internet -> RDS/Redis/Strapi/backend negado.
5. Stripe valida assinatura do webhook e Google valida a redirect URI; logs retêm metadados de acesso sem token, segredo ou corpo sensivel.
6. CloudWatch alarmes para rejeicoes WAF/ALB, targets unhealthy e mudancas de SG/route table via CloudTrail sao revisados.

## Rollback

Reverter alteracoes somente pelo commit Terraform anterior ou por uma excecao temporaria e registrada com o menor SG/path necessario. Em incidente de integracao, liberar o callback especifico por prazo curto, validar o fluxo e remover a excecao; nunca expor o backend inteiro, Strapi Admin, RDS ou Redis como rollback. Dados persistentes nao sao recriados nem movidos durante reversoes de rede.

## Consequencias

O time passa a manter rotas e excecoes explicitamente, o que pode revelar integracoes antigas ou healthchecks mal definidos antes do deploy. Em troca, reduz-se o risco de contornar BFF, autenticacao, rate limit e auditoria sobre dados de todos os tenants do ambiente.
