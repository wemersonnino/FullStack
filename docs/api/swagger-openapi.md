# Swagger e OpenAPI do Backend

Data: 2026-06-14

## Estado atual

O backend oficial `Backend/java-app1/demo` esta em validacao com Spring Boot `4.1.0` e Java `25`.

O Swagger atual nao usa Springdoc. A dependencia `springdoc-openapi-starter-webmvc-ui:2.8.17` foi testada e falhou em runtime com Spring Boot 4/Spring Framework 7 ao procurar a classe removida/reorganizada:

```text
org.springframework.boot.autoconfigure.web.servlet.WebMvcProperties
```

Por isso, a solucao vigente usa:

- `org.webjars:swagger-ui:5.32.2`
- `OpenApiController`
- Swagger UI manual
- OpenAPI JSON manual

## URLs

Com o backend rodando localmente:

```text
http://localhost:8080/swagger-ui/index.html
http://localhost:8080/swagger-ui.html
http://localhost:8080/v3/api-docs
```

## Arquivos envolvidos

- `Backend/java-app1/demo/pom.xml`
- `Backend/java-app1/demo/src/main/java/com/escala/authservice/controller/OpenApiController.java`
- `Backend/java-app1/demo/src/main/java/com/escala/authservice/config/SecurityConfiguration.java`

## Rotas liberadas no Spring Security

```text
/swagger-ui.html
/swagger-ui/**
/v3/api-docs/**
/webjars/**
```

## Grupos documentados

O JSON OpenAPI atual documenta `16` grupos:

- `Auth`
- `Usuarios`
- `Empresas`
- `Funcionarios`
- `Organizacao`
- `Escala Operacional`
- `Escalas e Trocas`
- `Ponto`
- `Relatorios`
- `Convites`
- `Marketing`
- `Billing`
- `IA`
- `Mensageria`
- `Capacidade Operacional`
- `Operacional`

## Controllers cobertos

- `AuthenticationController`
- `UserManagementController`
- `CompanyController`
- `EmployeeController`
- `OrganizationController`
- `WorkPostController`
- `EscalaController`
- `ScheduleController`
- `CheckInController`
- `ReportController`
- `TeamInvitationController`
- `LeadController`
- `ContactController`
- `BillingController`
- `StripeWebhookController`
- `AiController`
- `ChatbotWebhookController`
- `LearningProgressController`
- `MessageController`
- `OperationalCapacityController`
- `StatsController`

## Endpoints documentados

O Swagger atual documenta `59` paths:

```text
/actuator/health
/api/v1/auth/authenticate
/api/v1/auth/complete-registration
/api/v1/auth/forgot-password
/api/v1/auth/google
/api/v1/auth/register
/api/v1/auth/reset-password
/api/v1/public/contact
/api/v1/leads
/api/v1/ai/analyze-risk
/api/v1/ai/explain-conflict
/api/v1/ai/suggest-replacement
/api/v1/billing/cancel
/api/v1/billing/checkout
/api/v1/billing/subscription
/api/v1/billing/webhook
/api/v1/check-in
/api/v1/companies
/api/v1/companies/{id}
/api/v1/employees
/api/v1/employees/{id}
/api/v1/escala
/api/v1/escala/dia
/api/v1/escala/me
/api/v1/escala/usuarios
/api/v1/escala/usuarios/{id}
/api/v1/escala/{id}
/api/v1/learning-progress
/api/v1/learning-progress/{id}/complete
/api/v1/messages
/api/v1/messages/{id}/decision
/api/v1/operational-capacities
/api/v1/operational-capacities/target
/api/v1/operational-capacities/{id}
/api/v1/organization/projects
/api/v1/organization/projects/{id}
/api/v1/organization/sectors
/api/v1/organization/sectors/{id}
/api/v1/reports/payroll
/api/v1/reports/payroll/export
/api/v1/schedules
/api/v1/schedules/dashboard-summary
/api/v1/schedules/generate
/api/v1/schedules/swap-requests
/api/v1/schedules/swap-requests/{id}/colleague-approval
/api/v1/schedules/swap-requests/{id}/decision
/api/v1/stats/marketing
/api/v1/stats/summary
/api/v1/team/invitations
/api/v1/team/invitations/token/{token}
/api/v1/team/invitations/{id}
/api/v1/users
/api/v1/users/me
/api/v1/users/me/password
/api/v1/users/{id}/roles
/api/v1/users/{id}/theme
/api/v1/webhooks/chatbot
/api/v1/work-posts
/api/v1/work-posts/{id}
```

## Validacao

```bash
mvn test
docker compose up -d --build --force-recreate backend
curl -sS -o /tmp/swagger-host.html -w "%{http_code}" http://localhost:8080/swagger-ui/index.html
curl -sS -o /tmp/api-docs.json -w "%{http_code}" http://localhost:8080/v3/api-docs
jq '.tags | length' /tmp/api-docs.json
jq '.paths | keys | length' /tmp/api-docs.json
```

Resultado validado:

- Swagger UI: `200`
- OpenAPI JSON: `200`
- Tags: `16`
- Paths: `59`
- Testes Maven: `24` testes, `0` falhas, `0` erros

## Regras de manutencao

- Enquanto Springdoc nao estiver compativel com Spring Boot 4 neste projeto, qualquer novo endpoint REST deve ser documentado manualmente em `OpenApiController`.
- Nao documentar endpoints inexistentes.
- Manter verbos HTTP, path params e query params iguais aos controllers reais.
- Request/response schemas ainda sao descritivos; a geracao automatica de schemas deve ser reavaliada quando houver alternativa compativel.
