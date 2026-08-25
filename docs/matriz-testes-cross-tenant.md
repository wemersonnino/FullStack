# Matriz automatizada de testes cross-tenant

Esta matriz e o contrato de regressao do isolamento multi-tenant. Todo recurso novo ligado a uma empresa deve entrar aqui antes de ser exposto por controller ou BFF.

## Cenario padrao

- PostgreSQL real via Testcontainers, com dois tenants no mesmo banco.
- Fixtures deterministicas `tenant-a` e `tenant-b`, cada uma com owner e funcionario.
- O identificador de um registro do tenant B e conhecido pelo tenant A para simular IDOR.
- O tenant confiavel vem de `AuthenticatedUserPrincipal`; email, body, query string e headers nao podem troca-lo.
- Casos positivos do mesmo tenant acompanham os casos negativos para evitar protecao por indisponibilidade acidental.
- A excecao global somente existe para o papel explicito `SYSTEM_ADMIN` e deve preservar o tenant do registro alvo.

## Cobertura por recurso

| Recurso tenant-bound | Listagem | Leitura por ID | Atualizacao | Exclusao | Associacao | Excecao global | Evidencia automatizada |
|---|---:|---:|---:|---:|---:|---:|---|
| Usuarios | sim | sim | sim | sim | n/a | indireta | `UserManagementServiceTest`, consultas `findByIdAndCompanyId` e fixture da matriz |
| Funcionarios | sim | sim | sim | sim (soft delete) | setor/projeto | sim | `CrossTenantIsolationMatrixIntegrationTest` |
| Setores | sim | sim | sim | sim | gerente | caminho explicito | `CrossTenantIsolationMatrixIntegrationTest` |
| Projetos | sim | sim | sim | sim | funcionario/posto | caminho explicito | `CrossTenantIsolationMatrixIntegrationTest` |
| Turnos/escalas | sim | por funcionario/tenant | por tenant | por tenant | funcionario | nao exposta | `ScheduleServiceTest` e queries `employee.company.id` |
| Ciclos/publicacoes | sim | `companyId + publicId` | sim | arquivamento | atribuicoes/alertas | nao exposta | `ScheduleCycle*Test` e `ScheduleCyclePublicationIntegrationTest` |
| Convites | sim | token opaco | sim | desativacao | empresa/convidador | nao exposta | `TeamInvitationServiceTest` e `TeamInvitationIntegrationTest` |
| Relatorios | sim | n/a | n/a | n/a | filtros organizacionais | visao global explicita | `ReportServiceTest` |
| Configuracoes da empresa | tenant atual | tenant atual | tenant atual | n/a | empresa | administracao explicita | `CompanyService`/`TenantContextTest` |
| Billing | por `companyId` | por `companyId` | webhook por ID externo | n/a | empresa | operacao de sistema | `BillingServiceTest` e filtro Hibernate |
| Uso de IA | contagem por empresa | n/a | append-only | n/a | usuario/empresa | metrica global explicita | `BillingServiceTest` e filtro Hibernate |

`sim` significa que existe um caminho tenant-aware no codigo e ao menos uma regressao automatizada na suite indicada. Operacoes que nao fazem parte do contrato atual ficam como `n/a`; quando forem introduzidas, a matriz e os testes devem ser ampliados no mesmo pull request.

## Gate obrigatorio

O perfil Maven `integration` executa a matriz com Docker obrigatorio. A pipeline nao deve converter indisponibilidade do Docker em teste ignorado. Uma falha cross-tenant deve bloquear merge e ser corrigida no mesmo trabalho ou registrada como issue P0 vinculada ao `EPIC-TENANT`.
