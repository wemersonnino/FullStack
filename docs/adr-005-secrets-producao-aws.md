# ADR-005: Segredos de producao na AWS

**Status:** Aceito

**Data:** 2026-09-04
**Decisao relacionada:** issue #50 / P0-07

## Contexto

Arquivos `.env` e `*.env.example` sao uma conveniencia exclusiva de desenvolvimento local. Eles nao oferecem controle de acesso, auditoria, rotacao ou separacao confiavel quando copiados para um host. Um segredo de infraestrutura comprometido pode afetar todos os tenants de um ambiente; por isso seu impacto e tratado como alto.

O runtime alvo e AWS com ECS Fargate para frontend Next.js, backend Spring Boot, Strapi e workers. Esta decisao nao altera contratos REST nem coloca valores secretos no repositorio, imagens Docker, definicoes de task, logs ou artefatos de CI.

## Decisao

- Usar **AWS Secrets Manager** para credenciais e chaves cuja rotacao, geracao, integracao com RDS ou auditoria operacional sejam necessarias.
- Usar **SSM Parameter Store `SecureString`** somente para configuracoes sensiveis estaveis e de menor frequencia de rotacao. O parametro deve ser criptografado por KMS.
- Injetar valores apenas no runtime da task ECS, por referencias ao ARN do secret/parameter na task definition. A imagem recebe nomes de variaveis, nunca valores.
- Cada ambiente possui recursos, KMS keys e prefixos proprios. Development local nao e uma copia de homologacao ou producao.
- O frontend jamais recebe segredo: variaveis `NEXT_PUBLIC_*` sao publicas por definicao. Segredos de OAuth, Stripe e integracoes ficam no BFF/backend; somente identificadores publicos estritamente necessarios podem ir ao browser.

`Secrets Manager` e a opcao padrao para os itens de alto impacto abaixo. `SecureString` pode ser usado para um valor sensivel que nao exija rotacao automatizada, desde que tenha dono, data de revisao e mesmo nivel de IAM minimo.

## Inventario e classificacao

| Grupo | Exemplos de variaveis | Armazenamento | Consumidor autorizado | Rotacao |
| --- | --- | --- | --- | --- |
| Banco Escala | `DB_USER`, `DB_PASS`, URL/host privado | Secrets Manager; integrar rotacao RDS quando suportado | task Spring Boot e job de migracao | 90 dias ou incidente |
| Banco Strapi | `DATABASE_USERNAME`, `DATABASE_PASSWORD` | Secrets Manager | task Strapi e job de migracao CMS | 90 dias ou incidente |
| Autenticacao | `JWT_SECRET`, `NEXTAUTH_SECRET`, `INTERNAL_BFF_SHARED_SECRET` | Secrets Manager | backend; BFF somente quando estritamente necessario | 90 dias, com janela de chaves dupla |
| Google/OAuth | `GOOGLE_CLIENT_SECRET` | Secrets Manager | BFF ou backend responsavel pelo callback | no provedor e no secret ao menos a cada 180 dias |
| Stripe | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Secrets Manager | backend de billing/webhook | conforme Stripe, incidente ou 90 dias |
| Strapi | `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY` | Secrets Manager | task Strapi | 90 dias, com plano de invalidacao de sessoes/tokens |
| Integracoes | `RECAPTCHA_SECRET`, chaves de email, Slack, Teams, IA e storage | Secrets Manager | somente workload dono da integracao | conforme provedor, maximo 180 dias |
| Configuracao sensivel estavel | URLs internas autenticadas ou flags sensiveis justificadas | SSM SecureString + KMS | workload especifico | revisao semestral e por incidente |

Valores nao secretos, como hosts, portas, `STRAPI_BASE_URL` sem credencial e IDs publicos, devem permanecer como configuracao por ambiente e nao precisam ir ao cofre. Um valor passa a ser segredo se permitir autenticacao, assinatura, descriptografia, acesso administrativo ou uso faturavel de terceiro.

## Nomes e segregacao de ambientes

O namespace e obrigatorio e nao pode ser compartilhado entre ambientes:

```text
/escala/<environment>/<service>/<secret-name>
# environments: development-cloud, homolog, production
# services: frontend, backend, strapi, worker, database
```

Exemplo de referencia aceitavel na infraestrutura: `/escala/production/backend/jwt-signing-keys`. O valor nunca aparece no Terraform state, YAML de task, `docker compose config`, GitHub Actions output, ticket ou chat. A infraestrutura deve referenciar ARN/parameter name e carregar o valor pela integracao nativa ECS.

Cada ambiente usa conta AWS separada quando a organizacao permitir; no minimo, conta ou recursos, KMS key, prefixo e roles separados. E proibido usar um secret de producao em homologacao, development ou CI.

## IAM e KMS: menor privilegio

- A **execution role** do ECS pode ler somente os ARNs explicitamente referenciados pela task daquele servico e ambiente, usando `secretsmanager:GetSecretValue` e/ou `ssm:GetParameter`/`GetParameters`.
- A mesma role recebe `kms:Decrypt` somente na key que cifra aqueles recursos, condicionada a `kms:ViaService` para Secrets Manager ou SSM na regiao usada.
- A **task role** da aplicacao nao recebe leitura ampla de secrets. Se uma leitura dinamica for inevitavel, ela deve listar ARNs exatos e ser aprovada em revisao de seguranca.
- Role de deploy pode criar/associar referencias, mas nao ler valores. Operadores humanos usam SSO, permissao temporaria e CloudTrail; nao usam chaves IAM permanentes.
- Nao usar `secretsmanager:*`, `ssm:*`, `Resource: "*"` para leitura, nem compartilhar roles entre frontend, backend, Strapi e workers.
- KMS deve ter key policy que permita administracao apenas ao grupo de plataforma e decriptacao apenas aos roles dos workloads autorizados. CloudTrail deve registrar leituras e alteracoes de secret/parameter.

## Rotacao, recuperacao e deploy

1. O dono do segredo abre mudanca com escopo, impacto, ambiente e plano de rollback. A troca e ensaiada em homologacao primeiro.
2. Crie a nova versao no cofre; para JWT, aceite temporariamente chave atual e anterior por `kid` antes de assinar apenas com a nova. Para banco, valide a conta nova sem remover a anterior.
3. Faça deploy rolling/blue-green das tasks que consomem o valor. Secrets injetados como variavel de ambiente normalmente exigem nova task; nao assumir atualizacao em processo ja iniciado.
4. Execute smoke tests sem imprimir configuracoes: health, login/refresh quando aplicavel, conexao de banco, callback OAuth ou webhook de teste nao destrutivo.
5. Monitore erros de autenticacao, conexao e webhook. Apos a janela definida, revogue a versao/chave antiga e registre data, executor, recursos afetados e evidencias no sistema de mudancas.

Em falha, retorne a referencia para a versao anterior ainda valida no cofre e faça redeploy. Nao faça rollback criando `.env` no host ou restaurando valor em Git. Se houver suspeita de exposicao, revogue o segredo e as credenciais dependentes imediatamente; o rollback de disponibilidade nao substitui a resposta ao incidente.

## Protecao de logs, CI e desenvolvimento

- CI usa apenas fixtures identificadas como `ci-`/`test-`; nenhum workflow recebe ou testa com segredo de producao.
- Mascarar valores no provedor de CI e desabilitar `set -x`, dump de ambiente e `docker compose config` completo em logs/artefatos compartilhados.
- Aplicacoes devem registrar somente nome/versao/ARN parcialmente mascarado quando necessario, nunca valor, header `Authorization`, cookie, token JWT, connection string com senha ou payload de webhook.
- O gate `scripts/security/check-versioned-secrets.ps1` continua obrigatorio. Revisao de PR tambem deve procurar valores em manifests, fixtures, screenshots e documentacao.
- `.env` local permanece ignorado e nasce de arquivos `*.example` com placeholders invalidos. Ele nao e montado nem copiado para imagens de producao.

## Verificacao de aceite e operacao

Antes do primeiro deploy produtivo, a equipe de plataforma deve evidenciar:

- inventario acima preenchido com dono, ARN, ambiente, data de revisao e consumidores;
- policy IAM testada com um role permitido e outro negado para um ARN de homologacao;
- bootstrap de cada imagem sem `.env` embutido e task recebendo apenas as referencias autorizadas;
- rotacao nao destrutiva de pelo menos um secret em homologacao, com redeploy e smoke test;
- CloudTrail habilitado para Secrets Manager, SSM e KMS, e busca em CloudWatch confirmando ausencia de valores;
- execucao do scan de segredos versionados no CI.

## Consequencias

Ha custo e trabalho operacional adicionais para cofre, KMS, IAM, deploy apos rotacao e monitoramento. Em troca, o projeto passa a ter segregacao por ambiente, trilha de auditoria e recuperacao sem reintroduzir segredos no repositorio ou hosts persistentes.

Esta ADR substitui a escolha aberta entre cofre e `.env` para producao: `.env` nao e um mecanismo de producao. Ela complementa, sem substituir, a remediacao de segredos historicamente expostos documentada em `docs/secrets-rotacao-issue-49.md`.
