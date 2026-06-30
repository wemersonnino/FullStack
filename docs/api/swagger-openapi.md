# Swagger e OpenAPI do Backend

Data: 2026-06-30

## Estado atual

O backend oficial `Backend/java-app1/demo` usa Swagger/OpenAPI manual. O projeto nao usa Springdoc nesta branch porque `springdoc-openapi-starter-webmvc-ui:2.8.17` quebrou em runtime com Spring Boot 4 / Spring Framework 7 ao procurar `org.springframework.boot.autoconfigure.web.servlet.WebMvcProperties`.

A solucao vigente permanece:

- `org.webjars:swagger-ui:5.32.2`
- `OpenApiController`
- JSON OpenAPI manual em `/v3/api-docs`

## URLs locais

- `http://localhost:8080/swagger-ui/index.html`
- `http://localhost:8080/swagger-ui.html`
- `http://localhost:8080/v3/api-docs`

## Arquivos principais

- `Backend/java-app1/demo/pom.xml`
- `Backend/java-app1/demo/src/main/java/com/escala/authservice/controller/OpenApiController.java`
- `Backend/java-app1/demo/src/main/java/com/escala/authservice/config/SecurityConfiguration.java`

## Grupos documentados

Os grupos atuais incluem:

- `Auth`
- `Usuarios`
- `Empresas`
- `Funcionarios`
- `Organizacao`
- `Escala Operacional`
- `Escalas e Trocas`
- `Escala Inteligente`
- `Ponto`
- `Relatorios`
- `Convites`
- `Marketing`
- `Billing`
- `IA`
- `Mensageria`
- `Capacidade Operacional`
- `Operacional`
- `ReBAC`

## Controllers cobertos

Os controllers reais refletidos no `OpenApiController` incluem:

- `AuthenticationController`
- `UserManagementController`
- `CompanyController`
- `EmployeeController`
- `OrganizationController`
- `WorkPostController`
- `EscalaController`
- `ScheduleController`
- `SchedulingController`
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
- `RebacAdminController`

## Endpoints de destaque adicionados nesta fase

### Escala Inteligente

- `GET /api/v1/scheduling/month-calendar`
- `GET /api/v1/scheduling/legends`
- `GET /api/v1/scheduling/holidays`
- `POST /api/v1/scheduling/holidays`
- `POST /api/v1/scheduling/cycles`
- `GET /api/v1/scheduling/cycles/{id}`
- `GET /api/v1/scheduling/cycles/{id}/assignments`
- `PATCH /api/v1/scheduling/cycles/{id}/assignments`
- `GET /api/v1/scheduling/cycles/{id}/counters`
- `POST /api/v1/scheduling/cycles/{id}/validate`
- `GET /api/v1/scheduling/cycles/{id}/alerts`
- `POST /api/v1/scheduling/cycles/{id}/alerts/{alertId}/acknowledge`
- `POST /api/v1/scheduling/cycles/{id}/publish`
- `POST /api/v1/scheduling/cycles/{id}/rectify`
- `POST /api/v1/scheduling/cycles/{id}/archive`

### ReBAC

- `GET|POST /api/v1/rebac/manager-assignments`
- `DELETE /api/v1/rebac/manager-assignments/{id}`
- `GET|POST /api/v1/rebac/management-edges`
- `DELETE /api/v1/rebac/management-edges/{id}`
- `GET /api/v1/rebac/management-closure`
- `POST /api/v1/rebac/management-closure/recalculate`
- `GET /api/v1/rebac/enums/manager-scope-types`
- `GET /api/v1/rebac/enums/manager-role-levels`

### Mensageria

- `GET /api/v1/messages`
- `POST /api/v1/messages`
- `PATCH /api/v1/messages/{id}/decision`

## Regras de manutencao

- Qualquer endpoint REST novo ou alterado deve ser atualizado no `OpenApiController` na mesma PR/commit
- Nao documentar rotas que nao existam nos controllers reais
- Manter verbos HTTP, path params e query params alinhados com o codigo
- Quando a UI depender de um endpoint para produto, o BFF correspondente no Next.js tambem deve ser revisado no mesmo ciclo

## Validacao recomendada

```bash
cd Backend/java-app1/demo
./mvnw test

cd /home/wemersonpereirabhs/workspace/pessoal/FullStack
docker compose up -d --build backend
curl -I http://localhost:8080/swagger-ui/index.html
curl -I http://localhost:8080/v3/api-docs
```

Resultado esperado:

- Swagger UI responde `200`
- `v3/api-docs` responde `200`
- os grupos `Escala Inteligente` e `ReBAC` aparecem no JSON
