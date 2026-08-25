# Isolamento multi-tenant

## Invariante

Todo recurso tenant-bound pertence a exatamente uma `Company`. Toda operacao normal deve obter o tenant da identidade autenticada e incluir `companyId` na fronteira de persistencia. UUIDs, headers, query parameters ou corpos enviados pelo cliente nunca definem o tenant corrente.

`AuthenticatedUserPrincipal` e criado somente depois da validacao do JWT. `TenantContext` e a API central para obter o `companyId` confiavel e identificar a excecao explicita `SYSTEM_ADMIN`.

Para recursos tenant-bound, o padrao de repository e `findByIdAndCompanyId(id, tenantId)`, inclusive antes de update e delete. Associacoes devem ser resolvidas com o mesmo `companyId`. Um resultado cross-tenant deve ser tratado como recurso inexistente para evitar enumeracao por UUID.

O filtro Hibernate `tenantFilter` e defesa em profundidade no ciclo HTTP, nao substitui contratos tenant-aware em services, ports e repositories. Jobs e fluxos internos tambem devem informar tenant explicitamente.

## Classificacao inicial

Tenant-bound:

- `User`, `Employee`, `Sector`, `Project` e `WorkPost`;
- `WorkShift`, `Absence`, `TimeRecord`, `OperationalCapacity` e mensagens operacionais;
- `ScheduleCycle`, assignments, feriados e reconhecimentos de validacao;
- `TeamInvitation`, `Subscription`, `Invoice` e `AiUsage`;
- `AuditLog`, `ManagerAssignment`, `ManagementEdge` e `ManagementClosure`.

Globais ou pre-tenant:

- `Company` (raiz do tenant);
- `Role` e catalogos globais de autorizacao;
- tokens de recuperacao vinculados ao usuario;
- leads e contatos publicos ainda nao vinculados a uma empresa.

Entidades novas devem ser classificadas nesta lista e, quando tenant-bound, possuir `company_id`, indice adequado e APIs de persistencia tenant-aware.

## Acesso administrativo global

`SYSTEM_ADMIN` e a unica excecao global atual. O bypass e deliberado (`TenantContext.hasGlobalTenantAccess()`) e os services precisam escolher explicitamente um metodo global. Nao existe bypass implicito por tenant recebido do frontend. Operacoes administrativas cross-tenant devem continuar passando pelas regras de autorizacao e auditoria do caso de uso.

## Migracao incremental da issue #27

O primeiro recorte migra funcionarios, setores e projetos, incluindo suas associacoes. Os demais modulos continuam protegidos pelo filtro Hibernate no ciclo HTTP e devem migrar seus contratos para `id + companyId` gradualmente, priorizando escalas, usuarios, billing e IA.
