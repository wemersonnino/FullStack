# ADR-008: Autenticacao BFF/NextAuth e Spring Boot

**Status:** Aceito

**Data:** 2026-09-04

**Decisao relacionada:** issue #55 / P0-12

## Contexto e decisao

O browser autentica a aplicacao pelo NextAuth; o Spring Boot continua stateless e dono da identidade operacional e do isolamento por tenant. A auditoria da issue #55 encontrou que o access token do Spring ja era mantido no JWT criptografado do NextAuth e omitido da resposta `/api/auth/session`, mas o BFF aceitava opcionalmente um `Authorization` enviado pelo browser e rotas mutaveis nao tinham uma verificacao de origem comum.

A decisao e manter um unico modelo: cookie HttpOnly do NextAuth entre browser e BFF; `Authorization: Bearer` somente entre BFF e Spring. O browser nunca recebe, armazena nem reenviara o JWT do Spring.

```text
Browser -- cookie NextAuth HttpOnly, same-origin --> Next.js BFF
   |                                                   |
   | POST /api/auth/* (login/OAuth)                    | Bearer access token (server-side)
   v                                                   v
NextAuth ------------------------------------------> Spring Boot
                                                        |
                                                        v
                                           identidade JWT + companyId confiavel
```

O `companyId` vem exclusivamente do JWT validado pelo Spring e e aplicado por `TenantIsolationFilter`; BFF, payload, query string e cookie nao podem escolher tenant arbitrariamente.

## Transporte, CORS e CSRF

- O JWT de acesso do Spring dura 15 minutos por padrao e fica no JWT criptografado do NextAuth, protegido por `NEXTAUTH_SECRET`. O callback `session` devolve somente perfil minimo; a rota de sessao tambem remove defensivamente qualquer campo `user.token`.
- Rotas BFF autenticadas leem o access token no servidor. O fallback para `Authorization` recebido do navegador foi removido. Logs de BFF registram somente metodo, path e mensagem de erro, nunca token, cookie, corpo ou segredo.
- Toda mutacao em `/api/bff/**` e no proxy legado `/api/server/**` exige `Origin` exatamente igual a `NEXT_PUBLIC_APP_URL`/`NEXTAUTH_URL`. Origem ausente, invalida ou externa recebe `403`. Isto protege o cookie HttpOnly contra CSRF; rotas de leitura nao mudam estado.
- O Spring nao autentica por cookie: recebe Bearer do BFF em rede interna. Por isso CSRF fica desabilitado no Spring e `allowCredentials=false` no CORS. As origens permitidas continuam allowlist explicita em `app.cors.allowed-origins`; origem nao configurada falha no CORS.
- Login por credenciais e Google acontecem no handler NextAuth sobre HTTPS. O endpoint Spring de autenticacao e chamado server-to-server; Google usa callback e `state`/`nonce` do NextAuth. Em producao `NEXTAUTH_URL` e `NEXT_PUBLIC_APP_URL` devem ser a origem HTTPS canonica, sem curingas.

## Refresh e logout

O backend atual emite apenas access token; nao ha endpoint, DTO ou armazenamento de refresh token. A configuracao historica `JWT_REFRESH_EXPIRATION_MS` nao representa um contrato ativo e nao deve ser usada para supor renovacao silenciosa. A especificacao OpenAPI foi corrigida para nao anunciar `refreshToken`.

Logo, o refresh esta **explicitamente indisponivel** neste release: ao expirar o token, o BFF responde `401` e o cliente volta ao login. Uma futura implementacao precisa de issue propria: refresh token opaco, rotacao a cada uso, hash no servidor, revogacao, expiracao curta, auditoria e transporte apenas no servidor/HttpOnly; nunca em `localStorage` nem na session API.

Logout chama `signOut`, removendo o cookie de sessao NextAuth. Como o Spring usa JWT stateless, um Bearer ja emitido so seria valido na rede interna ate expirar (no maximo 15 minutos); ele nao e exposto ao browser. Revogacao imediata global fica fora deste contrato e exige a mesma evolucao de refresh/revogacao acima. Rollback da mudanca de origem e reverter o commit; nao habilitar CORS credentialed nem restaurar o fallback de Bearer do browser.

## Aceite e operacao

1. Teste unitario do Spring confirma origem CORS configurada aceita, origem externa rejeitada e `allowCredentials=false`.
2. Teste de navegador: `POST`, `PUT`, `PATCH` e `DELETE` BFF com `Origin` externo ou ausente retornam `403`; a mesma origem canonica funciona autenticada.
3. Teste de sessao confirma que `/api/auth/session` nao contem `token` nem `accessToken`; DevTools nao mostra Bearer em chamadas browser -> BFF.
4. Teste de expiracao confirma que, apos 15 minutos, uma chamada BFF autenticada retorna `401` e nao tenta refresh. Teste de logout confirma cookie removido e chamadas BFF posteriores retornam `401`.
5. Teste de tenant usa um token valido de empresa A contra recurso da empresa B e confirma `403`/`404`, sem aceitar `companyId` enviado pelo client.

Os itens 2 a 5 devem integrar o smoke test autenticado de homologacao antes de uma mudanca de dominio, OAuth, cookie ou proxy. A exposicao de Spring fora do BFF segue a [ADR-007](adr-007-exposicao-servicos-producao.md).
