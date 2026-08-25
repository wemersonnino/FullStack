# Autorizacao por acao e recurso

## Padrao obrigatorio

Autenticacao identifica o usuario; ela nao autoriza uma operacao. Cada operacao sensivel deve obter o usuario autenticado e o tenant confiavel, carregar o recurso no escopo aplicavel e invocar uma policy explicita antes de ler dados sensiveis ou persistir uma mutacao.

A decisao deve combinar, conforme o caso: identidade, tenant, role/permissao, ownership ou escopo gerenciado, recurso e acao. Controllers apenas traduzem HTTP. O frontend pode ocultar controles por UX, mas nao participa da decisao final.

Policies ficam em `security/authorization` quando protegem uma capacidade transversal. Policies de regra puramente operacional permanecem no modulo de dominio correspondente. Expressoes `@PreAuthorize` devem ser reservadas a gates simples; regras dependentes de tenant ou recurso nao devem ser codificadas em annotations complexas.

Negacoes usam mensagem generica quando a distincao poderia revelar a existencia de recurso de outro tenant. O `companyId` nunca e aceito como autoridade quando veio do request: o escopo normal vem de `AuthenticatedUserPrincipal`/`TenantContext` e do usuario resolvido pelo backend.

## SYSTEM_ADMIN

`SYSTEM_ADMIN` e o unico papel global atual. Seu bypass nunca e implicito: cada policy precisa reconhece-lo explicitamente. Acoes globais permitidas devem registrar auditoria com ator, acao, tipo/id do recurso e tenant alvo. O papel nao transforma automaticamente consultas tenant-bound em consultas globais e nao pode ser concedido ou revogado pela API comum de roles.

## Inventario avaliado na issue 38

| Capacidade | Enforcement atual | Contexto considerado |
| --- | --- | --- |
| Usuarios e roles | `IamAuthorizationPolicy` em `UserManagementService` | role, tenant, alvo, self e papel global |
| Funcionarios | `PolicyService` em `EmployeeService` | role, tenant e setor/hierarquia gerenciada |
| Setores e projetos | `PolicyService` em `OrganizationService` | role, tenant e setor gerenciado |
| Escalas e trocas | `PolicyService` em `ScheduleService` | role, tenant, funcionario, setor e participante |
| Ciclo mensal/publicacao | services de ciclo com repositories tenant-scoped | tenant, status do ciclo e acknowledgement |
| Convites | `PolicyService` em `TeamInvitationService` | role, tenant e role convidada |
| Relatorios e auditoria | policies chamadas antes das consultas | role e tenant |
| Billing | use case tenant-scoped e gate no controller | role e tenant |
| ReBAC | `PolicyService` em `RebacAdminService` | role, tenant e recurso organizacional |
| IA operacional | uso associado ao tenant; sem mutacao automatica de escala | tenant e limites comerciais |

Novas operacoes criticas devem acrescentar testes da policy (combinatoria) e do ponto de enforcement. O minimo cobre autorizado, autenticado sem permissao, cross-tenant, ownership quando aplicavel e comportamento explicito de `SYSTEM_ADMIN`.

## Rollback

A mudanca nao altera schema nem contratos REST. O rollback e a reversao do commit/PR, restaurando as verificacoes locais anteriores nos application services.
