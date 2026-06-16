package com.escala.authservice.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class OpenApiController {

    private static final String SWAGGER_UI_VERSION = "5.32.2";

    @GetMapping(value = {"/swagger-ui/index.html", "/swagger-ui.html"}, produces = MediaType.TEXT_HTML_VALUE)
    public String swaggerUi() {
        return """
                <!doctype html>
                <html lang="pt-BR">
                <head>
                  <meta charset="UTF-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <title>Escala API - Swagger UI</title>
                  <link rel="stylesheet" href="/webjars/swagger-ui/%s/swagger-ui.css">
                  <link rel="icon" type="image/png" href="/webjars/swagger-ui/%s/favicon-32x32.png">
                </head>
                <body>
                  <div id="swagger-ui"></div>
                  <script src="/webjars/swagger-ui/%s/swagger-ui-bundle.js"></script>
                  <script src="/webjars/swagger-ui/%s/swagger-ui-standalone-preset.js"></script>
                  <script>
                    window.onload = function() {
                      window.ui = SwaggerUIBundle({
                        url: "/v3/api-docs",
                        dom_id: "#swagger-ui",
                        deepLinking: true,
                        presets: [
                          SwaggerUIBundle.presets.apis,
                          SwaggerUIStandalonePreset
                        ],
                        layout: "StandaloneLayout"
                      });
                    };
                  </script>
                </body>
                </html>
                """.formatted(
                SWAGGER_UI_VERSION,
                SWAGGER_UI_VERSION,
                SWAGGER_UI_VERSION,
                SWAGGER_UI_VERSION
        );
    }

    @GetMapping(value = "/v3/api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public Map<String, Object> apiDocs() {
        Map<String, Object> spec = new LinkedHashMap<>();
        spec.put("openapi", "3.0.3");
        spec.put("info", info());
        spec.put("servers", List.of(Map.of("url", "http://localhost:8080", "description", "Backend local")));
        spec.put("tags", tags());
        spec.put("components", components());
        spec.put("security", List.of(Map.of("bearerAuth", List.of())));
        spec.put("paths", paths());
        return spec;
    }

    private Map<String, Object> info() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("title", "Escala API");
        info.put("description", "API Spring Boot para autenticacao, usuarios, empresas, funcionarios, organizacao, escalas, trocas, ponto e relatorios.");
        info.put("version", "v1");
        return info;
    }

    private List<Map<String, String>> tags() {
        return List.of(
                tag("Auth", "Cadastro, login, recuperacao de senha, Google SSO e conclusao de cadastro por convite."),
                tag("Usuarios", "Perfil do usuario autenticado, troca de senha, roles, tema e listagem administrativa."),
                tag("Empresas", "CRUD de empresas usadas para separar organizacoes e vincular usuarios e funcionarios."),
                tag("Funcionarios", "Cadastro e manutencao de funcionarios da empresa."),
                tag("Organizacao", "Cadastro de setores e projetos usados na alocacao e planejamento das escalas."),
                tag("Escala Operacional", "Calendario operacional de escalas por usuario, dia, filtros administrativos e usuarios escalaveis."),
                tag("Escalas e Trocas", "Geracao mensal de escala, solicitacoes de troca, aprovacao de colega, decisao final e resumo do dashboard."),
                tag("Ponto", "Registro de ponto com validacao de localizacao e IP."),
                tag("Relatorios", "Relatorios de folha, horas e exportacao CSV."),
                tag("Convites", "Convites de equipe para novos usuarios vinculados a uma empresa."),
                tag("Marketing", "Captura de leads, demo comercial e rastreio de campanha com consentimento."),
                tag("Billing", "Gerenciamento de assinaturas, planos, faturamento e webhooks do Stripe."),
                tag("Operacional", "Endpoints operacionais de saude e suporte a monitoramento.")
        );
    }

    private Map<String, String> tag(String name, String description) {
        return Map.of("name", name, "description", description);
    }

    private Map<String, Object> components() {
        Map<String, Object> securityScheme = new LinkedHashMap<>();
        securityScheme.put("type", "http");
        securityScheme.put("scheme", "bearer");
        securityScheme.put("bearerFormat", "JWT");

        Map<String, Object> components = new LinkedHashMap<>();
        components.put("securitySchemes", Map.of("bearerAuth", securityScheme));
        return components;
    }

    private Map<String, Object> paths() {
        Map<String, Object> paths = new LinkedHashMap<>();

        paths.put("/api/v1/auth/register", pathPost(postPublic("Auth", "Registrar usuario", "Cria uma nova conta, empresa inicial quando aplicavel, usuario OWNER/ADMIN e retorna tokens de autenticacao.", "RegisterRequest")));
        paths.put("/api/v1/auth/authenticate", pathPost(postPublic("Auth", "Autenticar usuario", "Valida email e senha e retorna access token e refresh token da sessao.", "AuthenticationRequest")));
        paths.put("/api/v1/auth/forgot-password", pathPost(postPublic("Auth", "Solicitar recuperacao de senha", "Recebe o email do usuario e inicia o fluxo de recuperacao de senha.", "ForgotPasswordRequest")));
        paths.put("/api/v1/auth/reset-password", pathPost(postPublic("Auth", "Redefinir senha", "Valida token de recuperacao e troca a senha do usuario.", "ResetPasswordRequest")));
        paths.put("/api/v1/auth/complete-registration", pathPost(post("Auth", "Concluir cadastro convidado", "Completa os dados de um usuario previamente convidado para uma equipe.", "CompleteRegistrationRequest")));
        paths.put("/api/v1/auth/google", pathPost(postPublic("Auth", "Autenticar com Google", "Valida idToken do Google, provisiona ou autentica o usuario e retorna tokens de acesso.", "GoogleLoginRequest")));
        paths.put("/api/v1/leads", pathPost(postPublic("Marketing", "Capturar lead comercial", "Recebe nome, email, empresa, consentimento e metadados de campanha para o fluxo de demo e relacionamento comercial.", "LeadCaptureRequest")));

        paths.put("/api/v1/users", path(
                get("Usuarios", "Listar usuarios", "Lista usuarios cadastrados para administracao."),
                null,
                null,
                null,
                null
        ));
        paths.put("/api/v1/users/me", path(
                get("Usuarios", "Consultar usuario atual", "Retorna perfil, empresa, roles e preferencias do usuario autenticado."),
                null,
                null,
                patch("Usuarios", "Atualizar usuario atual", "Atualiza dados editaveis do proprio perfil do usuario autenticado.", "UpdateCurrentUserRequest"),
                null
        ));
        paths.put("/api/v1/users/me/password", pathPatch(patch("Usuarios", "Alterar minha senha", "Altera a senha do usuario autenticado apos validar a senha atual.", "ChangePasswordRequest")));
        paths.put("/api/v1/users/{id}/roles", path(
                null,
                post("Usuarios", "Conceder role", "Adiciona uma role ao usuario informado.", "RoleChangeRequest", pathParam("id", "ID do usuario.")),
                null,
                null,
                deleteWithBody("Usuarios", "Revogar role", "Remove uma role do usuario informado.", "RoleChangeRequest", pathParam("id", "ID do usuario."))
        ));
        paths.put("/api/v1/users/{id}/theme", pathPatch(patch("Usuarios", "Atualizar tema do usuario", "Atualiza preferencia visual do usuario para light, dark ou system.", "ThemeRequest", pathParam("id", "ID do usuario."))));

        paths.put("/api/v1/companies", path(
                get("Empresas", "Listar empresas", "Lista empresas cadastradas no backend."),
                post("Empresas", "Criar empresa", "Cria uma empresa para vincular usuarios, funcionarios, setores e projetos.", "CompanyRequest")
        ));
        paths.put("/api/v1/companies/{id}", path(
                get("Empresas", "Buscar empresa", "Retorna os dados de uma empresa por ID.", pathParam("id", "ID da empresa.")),
                null,
                put("Empresas", "Atualizar empresa", "Atualiza cadastro e dados operacionais da empresa.", "CompanyRequest", pathParam("id", "ID da empresa.")),
                null,
                delete("Empresas", "Excluir empresa", "Remove a empresa informada quando permitido pelas regras de persistencia.", pathParam("id", "ID da empresa."))
        ));

        paths.put("/api/v1/employees", path(
                get("Funcionarios", "Listar funcionarios", "Lista funcionarios cadastrados para escalas, ponto e relatorios."),
                post("Funcionarios", "Criar funcionario", "Cadastra funcionario e seus vinculos operacionais.", "EmployeeRequest")
        ));
        paths.put("/api/v1/employees/{id}", path(
                null,
                null,
                put("Funcionarios", "Atualizar funcionario", "Atualiza dados cadastrais e operacionais do funcionario.", "EmployeeRequest", pathParam("id", "ID do funcionario.")),
                null,
                delete("Funcionarios", "Remover funcionario", "Remove ou desativa o funcionario informado conforme regra do service.", pathParam("id", "ID do funcionario."))
        ));

        paths.put("/api/v1/organization/sectors", path(
                get("Organizacao", "Listar setores", "Lista setores usados para agrupamento, cobertura e filtros de escala."),
                post("Organizacao", "Criar setor", "Cria setor organizacional para vinculo de funcionarios e projetos.", "SectorRequest")
        ));
        paths.put("/api/v1/organization/sectors/{id}", path(
                null,
                null,
                put("Organizacao", "Atualizar setor", "Atualiza nome e metadados do setor.", "SectorRequest", pathParam("id", "ID do setor.")),
                null,
                delete("Organizacao", "Excluir setor", "Exclui setor quando nao houver bloqueios de relacionamento.", pathParam("id", "ID do setor."))
        ));
        paths.put("/api/v1/organization/projects", path(
                get("Organizacao", "Listar projetos", "Lista projetos usados para alocacao, filtros e cobertura de escala."),
                post("Organizacao", "Criar projeto", "Cria projeto vinculado a operacao da empresa.", "ProjectRequest")
        ));
        paths.put("/api/v1/organization/projects/{id}", path(
                null,
                null,
                put("Organizacao", "Atualizar projeto", "Atualiza nome, setor ou metadados do projeto.", "ProjectRequest", pathParam("id", "ID do projeto.")),
                null,
                delete("Organizacao", "Excluir projeto", "Exclui projeto quando permitido pelas regras do service.", pathParam("id", "ID do projeto."))
        ));

        paths.put("/api/v1/escala/me", pathGet(get("Escala Operacional", "Minhas escalas", "Lista escalas do usuario autenticado em um periodo opcional.", queryParam("inicio", "Data inicial ISO yyyy-MM-dd."), queryParam("fim", "Data final ISO yyyy-MM-dd."))));
        paths.put("/api/v1/escala", path(
                get("Escala Operacional", "Listar escalas administrativas", "Lista escalas com filtros administrativos por periodo, usuario, setor e projeto. Requer ADMIN.", queryParam("inicio", "Data inicial ISO yyyy-MM-dd."), queryParam("fim", "Data final ISO yyyy-MM-dd."), queryParam("usuarioId", "ID do usuario escalado."), queryParam("setorId", "ID do setor."), queryParam("projetoId", "ID do projeto.")),
                post("Escala Operacional", "Criar escalas", "Cria uma ou mais escalas operacionais e registra o usuario responsavel. Requer ADMIN.", "EscalaRequest")
        ));
        paths.put("/api/v1/escala/dia", pathGet(get("Escala Operacional", "Listar escalas do dia", "Lista escalados para uma data. Admin ve todos; colaborador ve o que tem permissao.", queryParamRequired("data", "Data ISO yyyy-MM-dd."))));
        paths.put("/api/v1/escala/{id}", path(
                null,
                null,
                put("Escala Operacional", "Atualizar escala", "Atualiza escala existente e registra auditoria do responsavel. Requer ADMIN.", "EscalaRequest", pathParam("id", "ID da escala.")),
                null,
                delete("Escala Operacional", "Cancelar escala", "Cancela escala existente e retorna confirmacao. Requer ADMIN.", pathParam("id", "ID da escala."))
        ));
        paths.put("/api/v1/escala/usuarios", pathGet(get("Escala Operacional", "Listar usuarios escalaveis", "Lista usuarios disponiveis para escala com filtros por projeto, setor, empresa e busca textual. Requer ADMIN.", queryParam("projetoId", "ID do projeto."), queryParam("setorId", "ID do setor."), queryParam("empresaId", "ID da empresa."), queryParam("q", "Texto para busca por nome ou email."))));
        paths.put("/api/v1/escala/usuarios/{id}", pathGet(get("Escala Operacional", "Buscar usuario escalavel", "Retorna dados de um usuario disponivel para escala. Requer ADMIN.", pathParam("id", "ID do usuario."))));

        paths.put("/api/v1/schedules", pathGet(get("Escalas e Trocas", "Listar escala mensal", "Lista turnos de trabalho de um mes e ano.", queryParamRequired("year", "Ano da escala."), queryParamRequired("month", "Mes da escala, de 1 a 12."))));
        paths.put("/api/v1/schedules/generate", pathPost(post("Escalas e Trocas", "Gerar escala mensal", "Gera escala mensal a partir das regras de planejamento e disponibilidade.", "GenerateScheduleRequest")));
        paths.put("/api/v1/schedules/swap-requests", path(
                get("Escalas e Trocas", "Listar solicitacoes de troca", "Lista solicitacoes de troca de escala existentes."),
                post("Escalas e Trocas", "Solicitar troca de escala", "Cria solicitacao de troca para o usuario autenticado.", "CreateShiftSwapRequest")
        ));
        paths.put("/api/v1/schedules/swap-requests/{id}/decision", pathPatch(patch("Escalas e Trocas", "Decidir solicitacao de troca", "Aprova ou rejeita solicitacao de troca conforme decisao administrativa.", "DecideShiftSwapRequest", pathParam("id", "ID da solicitacao de troca."))));
        paths.put("/api/v1/schedules/swap-requests/{id}/colleague-approval", pathPatch(patch("Escalas e Trocas", "Aprovar troca pelo colega", "Registra aceite do colega envolvido na troca de escala.", pathParam("id", "ID da solicitacao de troca."))));
        paths.put("/api/v1/schedules/dashboard-summary", pathGet(get("Escalas e Trocas", "Resumo do dashboard de escala", "Retorna indicadores do mes para dashboard de escala.", queryParamRequired("year", "Ano do resumo."), queryParamRequired("month", "Mes do resumo, de 1 a 12."))));

        paths.put("/api/v1/check-in", pathPost(post("Ponto", "Registrar ponto", "Registra ponto do usuario autenticado validando geolocalizacao permitida e IP de origem.", "CheckInRequest")));

        paths.put("/api/v1/reports/payroll", pathGet(get("Relatorios", "Relatorio de folha", "Gera dados de folha para a empresa do usuario autenticado no mes informado.", queryParamRequired("month", "Mes de referencia no formato esperado pelo service."))));
        paths.put("/api/v1/reports/payroll/export", pathGet(get("Relatorios", "Exportar folha CSV", "Exporta o relatorio de folha do mes em arquivo CSV.", queryParamRequired("month", "Mes de referencia no formato esperado pelo service."))));

        paths.put("/api/v1/team/invitations", path(
                get("Convites", "Listar convites", "Lista convites da empresa do usuario autenticado."),
                post("Convites", "Convidar usuario", "Cria convite para novo membro da equipe e retorna token/status do convite.", "TeamInvitationRequest")
        ));
        paths.put("/api/v1/team/invitations/token/{token}", pathGet(getPublic("Convites", "Buscar convite por token", "Consulta convite publico por token para preencher fluxo de cadastro.", pathParam("token", "Token do convite."))));
        paths.put("/api/v1/team/invitations/{id}", pathDelete(delete("Convites", "Cancelar convite", "Cancela convite de equipe da empresa do usuario autenticado.", pathParam("id", "ID do convite."))));

        paths.put("/api/v1/billing/checkout", pathPost(post("Billing", "Criar sessao de checkout", "Gera uma URL do Stripe Checkout para assinatura de plano.", "BillingCheckoutRequest")));
        paths.put("/api/v1/billing/subscription", pathGet(get("Billing", "Consultar assinatura", "Retorna dados da assinatura ativa da empresa do usuario.")));
        paths.put("/api/v1/billing/cancel", pathPost(post("Billing", "Cancelar assinatura", "Solicita o cancelamento da assinatura ativa no Stripe.", null)));
        paths.put("/api/v1/billing/webhook", pathPost(postPublic("Billing", "Webhook do Stripe", "Endpoint assincrono para recebimento de eventos do Stripe (pagamento, atualizacao), protegido por assinatura digital.", null)));

        paths.put("/actuator/health", pathGet(getPublic("Operacional", "Health check", "Retorna o estado de saude do backend para validacao local, Docker e monitoramento.")));

        return paths;
    }

    private Map<String, Object> pathGet(Map<String, Object> operation) {
        return path(operation, null, null, null, null);
    }

    private Map<String, Object> pathPost(Map<String, Object> operation) {
        return path(null, operation, null, null, null);
    }

    private Map<String, Object> pathPatch(Map<String, Object> operation) {
        return path(null, null, null, operation, null);
    }

    private Map<String, Object> pathDelete(Map<String, Object> operation) {
        return path(null, null, null, null, operation);
    }

    private Map<String, Object> path(Map<String, Object> get, Map<String, Object> post) {
        return path(get, post, null, null, null);
    }

    private Map<String, Object> path(Map<String, Object> get, Map<String, Object> post, Map<String, Object> put, Map<String, Object> patch, Map<String, Object> delete) {
        Map<String, Object> path = new LinkedHashMap<>();
        if (get != null) {
            path.put("get", get);
        }
        if (post != null) {
            path.put("post", post);
        }
        if (put != null) {
            path.put("put", put);
        }
        if (patch != null) {
            path.put("patch", patch);
        }
        if (delete != null) {
            path.put("delete", delete);
        }
        return path;
    }

    @SafeVarargs
    private Map<String, Object> get(String tag, String summary, String description, Map<String, Object>... parameters) {
        return operation(tag, summary, description, false, null, parameters);
    }

    @SafeVarargs
    private Map<String, Object> getPublic(String tag, String summary, String description, Map<String, Object>... parameters) {
        return operation(tag, summary, description, true, null, parameters);
    }

    @SafeVarargs
    private Map<String, Object> post(String tag, String summary, String description, String requestName, Map<String, Object>... parameters) {
        return operation(tag, summary, description, false, requestName, parameters);
    }

    private Map<String, Object> postPublic(String tag, String summary, String description, String requestName) {
        return operation(tag, summary, description, true, requestName);
    }

    @SafeVarargs
    private Map<String, Object> put(String tag, String summary, String description, String requestName, Map<String, Object>... parameters) {
        return operation(tag, summary, description, false, requestName, parameters);
    }

    @SafeVarargs
    private Map<String, Object> patch(String tag, String summary, String description, Map<String, Object>... parameters) {
        return operation(tag, summary, description, false, null, parameters);
    }

    @SafeVarargs
    private Map<String, Object> patch(String tag, String summary, String description, String requestName, Map<String, Object>... parameters) {
        return operation(tag, summary, description, false, requestName, parameters);
    }

    @SafeVarargs
    private Map<String, Object> delete(String tag, String summary, String description, Map<String, Object>... parameters) {
        return operation(tag, summary, description, false, null, parameters);
    }

    @SafeVarargs
    private Map<String, Object> deleteWithBody(String tag, String summary, String description, String requestName, Map<String, Object>... parameters) {
        return operation(tag, summary, description, false, requestName, parameters);
    }

    @SafeVarargs
    private Map<String, Object> operation(String tag, String summary, String description, boolean publicEndpoint, String requestName, Map<String, Object>... parameters) {
        Map<String, Object> operation = new LinkedHashMap<>();
        operation.put("tags", List.of(tag));
        operation.put("summary", summary);
        operation.put("description", description);
        operation.put("operationId", operationId(tag, summary));
        if (parameters.length > 0) {
            operation.put("parameters", List.of(parameters));
        }
        if (requestName != null) {
            operation.put("requestBody", requestBody(requestName));
        }
        operation.put("responses", responses());
        if (publicEndpoint) {
            operation.put("security", List.of());
        }
        return operation;
    }

    private String operationId(String tag, String summary) {
        return (tag + " " + summary)
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }

    private Map<String, Object> requestBody(String requestName) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("description", "Payload " + requestName + ". Consulte os DTOs Java do backend para os campos exatos enquanto a geracao automatica de schemas estiver desabilitada no Spring Boot 4.");

        Map<String, Object> mediaType = new LinkedHashMap<>();
        mediaType.put("schema", schema);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("required", true);
        requestBody.put("description", requestName);
        requestBody.put("content", Map.of("application/json", mediaType));
        return requestBody;
    }

    private Map<String, Object> responses() {
        Map<String, Object> responses = new LinkedHashMap<>();
        responses.put("200", Map.of("description", "Operacao realizada com sucesso."));
        responses.put("400", Map.of("description", "Requisicao invalida ou regra de dominio violada."));
        responses.put("401", Map.of("description", "Token ausente, invalido ou expirado."));
        responses.put("403", Map.of("description", "Usuario autenticado sem permissao para a operacao."));
        responses.put("404", Map.of("description", "Recurso nao encontrado."));
        return responses;
    }

    private Map<String, Object> pathParam(String name, String description) {
        return parameter(name, "path", description, true);
    }

    private Map<String, Object> queryParam(String name, String description) {
        return parameter(name, "query", description, false);
    }

    private Map<String, Object> queryParamRequired(String name, String description) {
        return parameter(name, "query", description, true);
    }

    private Map<String, Object> parameter(String name, String in, String description, boolean required) {
        Map<String, Object> parameter = new LinkedHashMap<>();
        parameter.put("name", name);
        parameter.put("in", in);
        parameter.put("description", description);
        parameter.put("required", required);
        parameter.put("schema", Map.of("type", "string"));
        return parameter;
    }
}
