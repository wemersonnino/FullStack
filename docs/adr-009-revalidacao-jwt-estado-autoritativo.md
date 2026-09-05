# ADR-009: Revalidacao de JWT contra estado autoritativo

**Status:** Aceito

**Data:** 2026-09-04

**Decisao relacionada:** issue #56 / P0-13

## Decisao

O access token JWT continua curto, com 15 minutos por padrao, e prova apenas que o sujeito foi autenticado no momento da emissao. Em toda requisicao Bearer, antes de criar o `SecurityContext`, o backend consulta o usuario atual pelo `id` assinado e reconstrui a identidade com `active`, empresa, slug e roles atuais.

Claims de `roles`, `companyId`, `companySlug` e email presentes no token nao sao fonte de autorizacao. O filtro exige que `sub` e o claim `id` assinado coincidam e que o usuario e sua empresa estejam ativos; em qualquer ausencia, inconsistência ou erro de validacao a autenticacao falha fechada. O principal e as authorities passam a refletir somente o banco.

```text
Bearer JWT assinado (sub/id) -> usuario atual no banco -> ativo + empresa ativa?
                                                        | nao
                                                        v
                                                     401/sem contexto
                                                        |
                                                       sim
                                                        v
                                  principal/roles/tenant atuais -> policy/filtro tenant
```

## Semantica de revogacao

- Desativar usuario ou empresa bloqueia imediatamente qualquer access token existente na proxima chamada; login novo ja bloqueava usuario inativo.
- Remover/adicionar role e mover usuario entre tenants passam a valer na proxima chamada: roles e tenant antigos do JWT nao sao usados.
- Mudancas de role sao registradas em auditoria com ator, alvo, role e tenant do alvo.
- Logout do produto continua removendo a sessao NextAuth. Como o Bearer fica apenas na fronteira interna BFF -> Spring, nao existe token de browser para revogar no logout. Uma credencial interna emitida antes do logout ainda e sujeita a expiracao curta e a revalidacao acima.
- Nao ha refresh token ou endpoint de refresh no contrato atual. Logo nao existe refresh a ser emitido para usuario desativado; qualquer implementacao futura deve consultar o mesmo estado autoritativo, rotacionar token opaco e registrar revogacao.

Nao e mantida blacklist global de tokens: ela nao e necessaria para as transicoes de identidade administradas, pois a consulta autoritativa neutraliza os claims antigos imediatamente. Uma blacklist pode ser introduzida por incidente de comprometimento, com TTL maximo igual ao access token e sem substituir esta revalidacao.

## Testes e rollback

Os testes cobrem usuario desativado com JWT tecnicamente valido e a substituicao de role/tenant antigo pela identidade atual. A suite existente cobre autenticacao inativa e as policies tenant-aware; homologacao deve exercitar desativacao, alteracao de role e troca de tenant contra endpoints protegidos.

O rollback e reverter este commit, sem migracao ou estado de sessao persistido. Isso restaura a validacao anterior, mas reabre a janela maxima de 15 minutos para claims antigos; nao ha dados de usuario ou tokens para recuperar.
