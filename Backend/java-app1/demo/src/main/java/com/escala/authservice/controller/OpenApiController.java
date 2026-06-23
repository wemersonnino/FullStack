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
                tag("IA", "Assistente de Inteligência Artificial para escala e riscos."),
                tag("Mensageria", "Mensagens, notificacoes, solicitacoes de permissao e central de comunicacao."),
                tag("Capacidade Operacional", "Gerenciamento de capacidade minima de colaboradores por posto ou setor."),
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
        paths.put("/api/v1/public/contact", pathPost(postPublic("Marketing", "Enviar mensagem de contato", "Recebe nome, email, assunto e mensagem via formulario hexagonal e processa o envio.", "ContactRequest")));
        paths.put("/api/v1/leads", pathPost(postPublic("Marketing", "Capturar lead comercial", "Recebe nome, email, empresa, consentimento e metadados de campanha para o fluxo de demo e relacionamento comercial.", "LeadCaptureRequest")));

        // IA
        paths.put("/api/v1/ai/suggest-replacement", pathPost(post("IA", "Sugerir substituto", "Sugere um colaborador substituto qualificado para um turno vago usando IA.", "AiContextRequest")));
        paths.put("/api/v1/ai/analyze-risk", pathPost(post("IA", "Analisar riscos de escala", "Analisa os riscos de cobertura e gargalos na escala para o periodo usando IA.", "AiContextRequest")));
        paths.put("/api/v1/ai/explain-conflict", pathPost(post("IA", "Explicar conflito de escala", "Explica o motivo de um conflito trabalhista gerado por uma escala usando IA.", "AiContextRequest")));

        paths.put("/api/v1/learning-progress", path(
                get("Usuarios", "Meu progresso de aprendizado", "Retorna a lista de topicos e modulos concluídos pelo usuario logado."),
                post("Usuarios", "Registrar progresso", "Salva a conclusão de um novo topico de aprendizado.", "LearningProgressRequest")
        ));
        paths.put("/api/v1/learning-progress/{id}/complete", pathPatch(patch("Usuarios", "Marcar como concluído", "Atualiza um item de aprendizado existente para o estado concluído.", pathParam("id", "ID do registro."))));

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

        // WorkPosts
        paths.put("/api/v1/work-posts", path(
                get("Organizacao", "Listar postos de trabalho", "Lista postos de trabalho cadastrados."),
                post("Organizacao", "Criar posto de trabalho", "Cria um novo posto de trabalho associado a um projeto e empresa.", "WorkPostRequest")
        ));
        paths.put("/api/v1/work-posts/{id}", pathDelete(delete("Organizacao", "Excluir posto de trabalho", "Remove o posto de trabalho informado.", pathParam("id", "ID do posto de trabalho."))));

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

        // Stats
        paths.put("/api/v1/stats/summary", pathGet(get("Relatorios", "Resumo estatistico do dashboard", "Retorna indicadores do mes para o dashboard administrativo.", queryParamRequired("year", "Ano do resumo."), queryParamRequired("month", "Mes do resumo, de 1 a 12."))));
        paths.put("/api/v1/stats/marketing", pathGet(get("Marketing", "Estatisticas de marketing", "Retorna metricas de conversao de leads e atribuicao de campanhas. Requer ADMIN.")));

        // Mensageria e Notificações (ReBAC)
        paths.put("/api/v1/messages", path(
                get("Mensageria", "Listar mensagens", "Retorna mensagens e solicitacoes recebidas ou enviadas pelo usuario autenticado, opcionalmente filtrando por status.", queryParam("status", "Status da mensagem (PENDING, APPROVED, REJECTED, READ).")),
                post("Mensageria", "Criar/Enviar mensagem", "Envia uma mensagem ou cria uma solicitacao de decisao.", "MessageRequest")
        ));
        paths.put("/api/v1/messages/{id}/decision", pathPatch(patch("Mensageria", "Decidir solicitacao", "Aprova ou rejeita uma solicitacao pendente (por exemplo, troca de escala ou permissao).", "MessageDecisionRequest", pathParam("id", "ID da mensagem/solicitacao."))));

        // Capacidade Operacional
        paths.put("/api/v1/operational-capacities", path(
                get("Capacidade Operacional", "Listar capacidades", "Retorna a lista completa de capacidades operacionais configuradas para a empresa do usuario logado."),
                post("Capacidade Operacional", "Definir capacidade", "Configura uma nova capacidade minima operacional para um setor ou posto de trabalho.", "OperationalCapacityRequest")
        ));
        paths.put("/api/v1/operational-capacities/target", pathGet(get("Capacidade Operacional", "Buscar por setor ou posto", "Retorna capacidades operacionais filtradas por targetId e targetType.", queryParamRequired("targetId", "ID do setor ou posto de trabalho."), queryParamRequired("targetType", "Tipo de destino (SECTOR ou WORK_POST)."))));
        paths.put("/api/v1/operational-capacities/{id}", path(
                null,
                null,
                put("Capacidade Operacional", "Atualizar capacidade", "Atualiza os limites de capacidade operacional existentes.", "OperationalCapacityRequest", pathParam("id", "ID do registro de capacidade.")),
                null,
                delete("Capacidade Operacional", "Excluir capacidade", "Exclui a configuracao de capacidade operacional informada.", pathParam("id", "ID do registro de capacidade."))
        ));

        // IA Chatbot Webhook
        paths.put("/api/v1/webhooks/chatbot", pathPost(postPublic("IA", "Webhook do Chatbot", "Recebe payloads simulados de mensagens do WhatsApp/Telegram para analise de trocas via IA.", "ChatbotWebhookRequest")));

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
        String responseName = inferResponseName(summary, requestName);
        operation.put("responses", responses(responseName));
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
        Map<String, Object> schema = buildRequestSchema(requestName);

        Map<String, Object> mediaType = new LinkedHashMap<>();
        mediaType.put("schema", schema);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("required", true);
        requestBody.put("description", requestName);
        requestBody.put("content", Map.of("application/json", mediaType));
        return requestBody;
    }

    private Map<String, Object> buildRequestSchema(String requestName) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("title", requestName);

        Map<String, Object> properties = new LinkedHashMap<>();

        switch (requestName) {
            case "AuthenticationRequest":
                properties.put("email", Map.of("type", "string", "example", "admin@escala.local"));
                properties.put("password", Map.of("type", "string", "example", "Admin@123456"));
                properties.put("companySlug", Map.of("type", "string", "example", "escala-demo"));
                properties.put("recaptchaToken", Map.of("type", "string", "example", "valid-token"));
                break;
            case "RegisterRequest":
                properties.put("username", Map.of("type", "string", "example", "gestor1"));
                properties.put("email", Map.of("type", "string", "example", "gestor1@escala.local"));
                properties.put("password", Map.of("type", "string", "example", "Admin@123456"));
                properties.put("companyName", Map.of("type", "string", "example", "Minha Empresa LTDA"));
                properties.put("companySlug", Map.of("type", "string", "example", "minha-empresa"));
                properties.put("recaptchaToken", Map.of("type", "string", "example", "valid-token"));
                break;
            case "ForgotPasswordRequest":
                properties.put("email", Map.of("type", "string", "example", "admin@escala.local"));
                properties.put("companySlug", Map.of("type", "string", "example", "escala-demo"));
                properties.put("recaptchaToken", Map.of("type", "string", "example", "valid-token"));
                break;
            case "ResetPasswordRequest":
                properties.put("code", Map.of("type", "string", "example", "abc-123-xyz"));
                properties.put("password", Map.of("type", "string", "example", "NovaSenha@123"));
                properties.put("passwordConfirmation", Map.of("type", "string", "example", "NovaSenha@123"));
                properties.put("recaptchaToken", Map.of("type", "string", "example", "valid-token"));
                break;
            case "CompleteRegistrationRequest":
                properties.put("companyName", Map.of("type", "string", "example", "Minha Empresa LTDA"));
                properties.put("cnpj", Map.of("type", "string", "example", "12.345.678/0001-90"));
                properties.put("password", Map.of("type", "string", "example", "NovaSenha@123"));
                break;
            case "GoogleLoginRequest":
                properties.put("idToken", Map.of("type", "string", "example", "eyJhbGciOiJSUzI1NiIs..."));
                properties.put("companySlug", Map.of("type", "string", "example", "escala-demo"));
                properties.put("recaptchaToken", Map.of("type", "string", "example", "valid-token"));
                properties.put("attribution", Map.of(
                    "type", "object",
                    "properties", Map.of(
                        "utm_source", Map.of("type", "string", "example", "google"),
                        "utm_medium", Map.of("type", "string", "example", "cpc"),
                        "utm_campaign", Map.of("type", "string", "example", "blackfriday")
                    )
                ));
                break;
            case "ContactRequest":
                properties.put("name", Map.of("type", "string", "example", "João Silva"));
                properties.put("email", Map.of("type", "string", "example", "joao@empresa.com"));
                properties.put("subject", Map.of("type", "string", "example", "Dúvida sobre planos"));
                properties.put("message", Map.of("type", "string", "example", "Gostaria de saber mais sobre o plano Professional."));
                break;
            case "LeadCaptureRequest":
                properties.put("name", Map.of("type", "string", "example", "João Silva"));
                properties.put("email", Map.of("type", "string", "example", "joao@empresa.com"));
                properties.put("companyName", Map.of("type", "string", "example", "Minha Empresa LTDA"));
                properties.put("recaptchaToken", Map.of("type", "string", "example", "valid-token"));
                break;
            case "LearningProgressRequest":
                properties.put("module", Map.of("type", "string", "example", "Treinamento Inicial"));
                properties.put("topic", Map.of("type", "string", "example", "introducao-escala"));
                properties.put("completed", Map.of("type", "boolean", "example", true));
                properties.put("notes", Map.of("type", "string", "example", "Comentários adicionais sobre o progresso"));
                break;
            case "UpdateCurrentUserRequest":
                properties.put("username", Map.of("type", "string", "example", "admin_novo"));
                properties.put("email", Map.of("type", "string", "example", "admin@escala.local"));
                properties.put("theme", Map.of("type", "string", "example", "dark"));
                properties.put("avatarUrl", Map.of("type", "string", "example", "http://avatar.url"));
                properties.put("address", Map.of("type", "string", "example", "Rua A, 123"));
                properties.put("cep", Map.of("type", "string", "example", "30140-000"));
                properties.put("street", Map.of("type", "string", "example", "Rua A"));
                properties.put("number", Map.of("type", "string", "example", "123"));
                properties.put("complement", Map.of("type", "string", "example", "Apto 1"));
                properties.put("neighborhood", Map.of("type", "string", "example", "Centro"));
                properties.put("city", Map.of("type", "string", "example", "Belo Horizonte"));
                properties.put("state", Map.of("type", "string", "example", "MG"));
                properties.put("position", Map.of("type", "string", "example", "Diretor"));
                properties.put("function", Map.of("type", "string", "example", "Administrador"));
                break;
            case "ChangePasswordRequest":
                properties.put("currentPassword", Map.of("type", "string", "example", "Admin@123456"));
                properties.put("newPassword", Map.of("type", "string", "example", "NovaSenha@123"));
                break;
            case "RoleChangeRequest":
                properties.put("roleName", Map.of("type", "string", "example", "MANAGER"));
                break;
            case "ThemeRequest":
                properties.put("theme", Map.of("type", "string", "example", "dark"));
                break;
            case "SectorRequest":
                properties.put("name", Map.of("type", "string", "example", "UTI Pediátrica"));
                properties.put("description", Map.of("type", "string", "example", "Ala de internação intensiva pediátrica"));
                properties.put("maxSeats", Map.of("type", "integer", "example", 5));
                break;
            case "ProjectRequest":
                properties.put("name", Map.of("type", "string", "example", "Plantão Noturno HGB"));
                properties.put("description", Map.of("type", "string", "example", "Alocação do plantão noturno no Hospital Geral"));
                properties.put("active", Map.of("type", "boolean", "example", true));
                break;
            case "AiContextRequest":
                properties.put("employeeId", Map.of("type", "integer", "format", "int64", "example", 1));
                properties.put("shiftId", Map.of("type", "integer", "format", "int64", "example", 101));
                properties.put("date", Map.of("type", "string", "format", "date", "example", "2026-06-25"));
                properties.put("sectorId", Map.of("type", "integer", "format", "int64", "example", 1));
                break;
            case "WorkPostRequest":
                properties.put("name", Map.of("type", "string", "example", "Posto de Recepção"));
                properties.put("description", Map.of("type", "string", "example", "Guarita de entrada do bloco A"));
                properties.put("project", Map.of(
                    "type", "object",
                    "properties", Map.of("id", Map.of("type", "integer", "format", "int64", "example", 1))
                ));
                break;
            case "GenerateScheduleRequest":
                properties.put("year", Map.of("type", "integer", "example", 2026));
                properties.put("month", Map.of("type", "integer", "example", 6));
                properties.put("startTime", Map.of("type", "string", "format", "time", "example", "08:00:00"));
                properties.put("endTime", Map.of("type", "string", "format", "time", "example", "17:00:00"));
                properties.put("workMode", Map.of("type", "string", "example", "PRESENCIAL"));
                properties.put("maxPresentialPerDay", Map.of("type", "integer", "example", 10));
                properties.put("employeeIds", Map.of("type", "array", "items", Map.of("type", "integer"), "example", List.of(1, 2, 3)));
                break;
            case "CheckInRequest":
                properties.put("latitude", Map.of("type", "number", "format", "double", "example", -23.55052));
                properties.put("longitude", Map.of("type", "number", "format", "double", "example", -46.633308));
                properties.put("deviceFingerprint", Map.of("type", "string", "example", "browser-fingerprint-abc123xyz"));
                properties.put("recaptchaToken", Map.of("type", "string", "example", "valid-token"));
                break;
            case "EscalaRequest":
                properties.put("employeeId", Map.of("type", "integer", "format", "int64", "example", 1));
                properties.put("dates", Map.of("type", "array", "items", Map.of("type", "string", "format", "date"), "example", List.of("2026-06-20", "2026-06-21")));
                properties.put("startTime", Map.of("type", "string", "format", "time", "example", "08:00:00"));
                properties.put("endTime", Map.of("type", "string", "format", "time", "example", "17:00:00"));
                properties.put("workMode", Map.of("type", "string", "enum", List.of("PRESENCIAL", "REMOTO"), "example", "PRESENCIAL"));
                properties.put("padraoEscala", Map.of("type", "string", "enum", List.of("COMUM", "SEIS_X_UM", "CINCO_X_DOIS", "DOZE_X_TRINTA_E_SEIS"), "example", "COMUM"));
                properties.put("notes", Map.of("type", "string", "example", "Escala do plantão"));
                properties.put("sectorId", Map.of("type", "integer", "format", "int64", "example", 1));
                properties.put("projectId", Map.of("type", "integer", "format", "int64", "example", 1));
                properties.put("companyId", Map.of("type", "integer", "format", "int64", "example", 1));
                break;
            case "CreateShiftSwapRequest":
                properties.put("requesterId", Map.of("type", "integer", "format", "int64", "example", 1));
                properties.put("originalShiftId", Map.of("type", "integer", "format", "int64", "example", 101));
                properties.put("compensationDate", Map.of("type", "string", "format", "date", "example", "2026-06-25"));
                properties.put("comments", Map.of("type", "string", "example", "Necessidade pessoal"));
                break;
            case "DecideShiftSwapRequest":
                properties.put("approved", Map.of("type", "boolean", "example", true));
                properties.put("effective", Map.of("type", "boolean", "example", true));
                properties.put("adminComments", Map.of("type", "string", "example", "Aprovado de acordo com a escala"));
                break;
            case "EmployeeRequest":
                properties.put("fullName", Map.of("type", "string", "example", "João Silva"));
                properties.put("email", Map.of("type", "string", "example", "joao.silva@empresa.com"));
                properties.put("active", Map.of("type", "boolean", "example", true));
                properties.put("sectorId", Map.of("type", "integer", "format", "int64", "example", 1));
                properties.put("projectId", Map.of("type", "integer", "format", "int64", "example", 1));
                break;
            case "CompanyRequest":
                properties.put("name", Map.of("type", "string", "example", "Minha Empresa LTDA"));
                properties.put("cnpj", Map.of("type", "string", "example", "12.345.678/0001-90"));
                properties.put("active", Map.of("type", "boolean", "example", true));
                properties.put("planType", Map.of("type", "string", "example", "TRIAL"));
                properties.put("allowedRadius", Map.of("type", "integer", "example", 100));
                properties.put("latitude", Map.of("type", "number", "format", "double", "example", -23.55052));
                properties.put("longitude", Map.of("type", "number", "format", "double", "example", -46.633308));
                break;
            case "TeamInvitationRequest":
                properties.put("email", Map.of("type", "string", "example", "novo_membro@empresa.com"));
                properties.put("roleName", Map.of("type", "string", "example", "USER"));
                break;
            case "BillingCheckoutRequest":
                properties.put("planType", Map.of("type", "string", "example", "PROFESSIONAL"));
                properties.put("successUrl", Map.of("type", "string", "example", "http://localhost:3000/success"));
                properties.put("cancelUrl", Map.of("type", "string", "example", "http://localhost:3000/cancel"));
                break;
            case "MessageRequest":
                properties.put("receiverId", Map.of("type", "integer", "format", "int64", "example", 2));
                properties.put("type", Map.of("type", "string", "enum", List.of("PERMISSION_REQUEST", "SHIFT_SWAP", "MESSAGE", "CHAT"), "example", "PERMISSION_REQUEST"));
                properties.put("title", Map.of("type", "string", "example", "Solicitação de Acesso"));
                properties.put("content", Map.of("type", "string", "example", "Solicito permissão para gerenciar a escala do setor UTI."));
                properties.put("metadata", Map.of("type", "string", "example", "{\"sectorId\":1}"));
                break;
            case "MessageDecisionRequest":
                properties.put("decision", Map.of("type", "string", "enum", List.of("APPROVED", "REJECTED"), "example", "APPROVED"));
                break;
            case "OperationalCapacityRequest":
                properties.put("targetId", Map.of("type", "integer", "format", "int64", "example", 1));
                properties.put("targetType", Map.of("type", "string", "enum", List.of("SECTOR", "WORK_POST"), "example", "SECTOR"));
                properties.put("dayOfWeek", Map.of("type", "integer", "minimum", 1, "maximum", 7, "example", 1));
                properties.put("startTime", Map.of("type", "string", "format", "time", "example", "08:00:00"));
                properties.put("endTime", Map.of("type", "string", "format", "time", "example", "17:00:00"));
                properties.put("minEmployeesRequired", Map.of("type", "integer", "example", 2));
                break;
            case "ChatbotWebhookRequest":
                properties.put("senderEmail", Map.of("type", "string", "example", "colaborador@escala.local"));
                properties.put("message", Map.of("type", "string", "example", "Preciso de uma troca para o meu plantão de amanhã"));
                properties.put("phone", Map.of("type", "string", "example", "+5531999998888"));
                break;
            default:
                schema.put("description", "Payload " + requestName + ". Consulte os DTOs Java do backend para os campos exatos.");
                return schema;
        }

        schema.put("properties", properties);
        return schema;
    }

    private Map<String, Object> responses() {
        return responses(null);
    }

    private Map<String, Object> responses(String responseName) {
        Map<String, Object> responses = new LinkedHashMap<>();
        if (responseName != null) {
            Map<String, Object> schema = buildResponseSchema(responseName);
            Map<String, Object> mediaType = new LinkedHashMap<>();
            mediaType.put("schema", schema);
            responses.put("200", Map.of(
                "description", "Operacao realizada com sucesso.",
                "content", Map.of("application/json", mediaType)
            ));
        } else {
            responses.put("200", Map.of("description", "Operacao realizada com sucesso."));
        }
        responses.put("400", Map.of("description", "Requisicao invalida ou regra de dominio violada."));
        responses.put("401", Map.of("description", "Token ausente, invalido ou expirado."));
        responses.put("403", Map.of("description", "Usuario autenticado sem permissao para a operacao."));
        responses.put("404", Map.of("description", "Recurso nao encontrado."));
        return responses;
    }

    private String inferResponseName(String summary, String requestName) {
        String s = summary.toLowerCase();
        if (s.contains("autenticar") || s.contains("registrar usuario") || s.contains("google")) {
            return "AuthResponse";
        }
        if (s.contains("usuario") || s.contains("users") || s.contains("minha senha") || s.contains("role")) {
            return "UserResponse";
        }
        if (s.contains("funcionario")) {
            return "EmployeeResponse";
        }
        if (s.contains("empresa")) {
            return "CompanyResponse";
        }
        if (s.contains("setor")) {
            return "SectorResponse";
        }
        if (s.contains("projeto")) {
            return "ProjectResponse";
        }
        if (s.contains("posto de trabalho")) {
            return "WorkPostResponse";
        }
        if (s.contains("mensagem") || s.contains("solicitacao") || s.contains("decidir")) {
            return "MessageResponse";
        }
        if (s.contains("capacidade")) {
            return "OperationalCapacityResponse";
        }
        if (s.contains("ponto") || s.contains("check-in")) {
            return "CheckInResponse";
        }
        if (s.contains("escala") || s.contains("schedule")) {
            return "EscalaResponse";
        }
        if (s.contains("troca")) {
            return "ShiftSwapResponse";
        }
        if (s.contains("checkout")) {
            return "CheckoutResponse";
        }
        if (s.contains("assinatura")) {
            return "SubscriptionResponse";
        }
        if (s.contains("progresso")) {
            return "LearningProgressResponse";
        }
        if (s.contains("folha") || s.contains("payroll")) {
            return "PayrollResponse";
        }
        if (s.contains("estatistico") || s.contains("marketing")) {
            return "StatsResponse";
        }
        if (s.contains("webhook")) {
            return "WebhookResponse";
        }
        return null;
    }

    private Map<String, Object> buildResponseSchema(String responseName) {
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("title", responseName);

        Map<String, Object> properties = new LinkedHashMap<>();

        switch (responseName) {
            case "AuthResponse":
                properties.put("token", Map.of("type", "string", "example", "eyJhbGciOiJSUzI1NiIs..."));
                properties.put("refreshToken", Map.of("type", "string", "example", "d3b07384d113ed1a..."));
                properties.put("user", Map.of(
                    "type", "object",
                    "properties", Map.of(
                        "id", Map.of("type", "integer", "example", 1),
                        "username", Map.of("type", "string", "example", "admin"),
                        "email", Map.of("type", "string", "example", "admin@escala.local")
                    )
                ));
                break;
            case "UserResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("username", Map.of("type", "string", "example", "admin"));
                properties.put("email", Map.of("type", "string", "example", "admin@escala.local"));
                properties.put("roles", Map.of("type", "array", "items", Map.of("type", "string"), "example", List.of("ADMIN")));
                properties.put("theme", Map.of("type", "string", "example", "dark"));
                properties.put("avatarUrl", Map.of("type", "string", "example", "http://avatar.url"));
                properties.put("active", Map.of("type", "boolean", "example", true));
                break;
            case "EmployeeResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("fullName", Map.of("type", "string", "example", "João Silva"));
                properties.put("email", Map.of("type", "string", "example", "joao.silva@empresa.com"));
                properties.put("active", Map.of("type", "boolean", "example", true));
                properties.put("sectorId", Map.of("type", "integer", "example", 1));
                properties.put("projectId", Map.of("type", "integer", "example", 1));
                break;
            case "CompanyResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("name", Map.of("type", "string", "example", "Minha Empresa LTDA"));
                properties.put("cnpj", Map.of("type", "string", "example", "12.345.678/0001-90"));
                properties.put("active", Map.of("type", "boolean", "example", true));
                properties.put("planType", Map.of("type", "string", "example", "TRIAL"));
                properties.put("allowedRadius", Map.of("type", "integer", "example", 100));
                break;
            case "SectorResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("name", Map.of("type", "string", "example", "UTI Pediátrica"));
                properties.put("description", Map.of("type", "string", "example", "Ala intensiva"));
                properties.put("maxSeats", Map.of("type", "integer", "example", 5));
                break;
            case "ProjectResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("name", Map.of("type", "string", "example", "Plantão Noturno HGB"));
                properties.put("description", Map.of("type", "string", "example", "Ala HGB"));
                properties.put("active", Map.of("type", "boolean", "example", true));
                break;
            case "WorkPostResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("name", Map.of("type", "string", "example", "Posto Recepção"));
                properties.put("description", Map.of("type", "string", "example", "Guarita bloco A"));
                break;
            case "MessageResponse":
                properties.put("id", Map.of("type", "integer", "example", 10));
                properties.put("senderId", Map.of("type", "integer", "example", 1));
                properties.put("receiverId", Map.of("type", "integer", "example", 2));
                properties.put("type", Map.of("type", "string", "example", "PERMISSION_REQUEST"));
                properties.put("title", Map.of("type", "string", "example", "Solicitação"));
                properties.put("content", Map.of("type", "string", "example", "Permissão para escala."));
                properties.put("status", Map.of("type", "string", "example", "PENDING"));
                properties.put("metadata", Map.of("type", "string", "example", "{}"));
                break;
            case "OperationalCapacityResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("targetId", Map.of("type", "integer", "example", 1));
                properties.put("targetType", Map.of("type", "string", "example", "SECTOR"));
                properties.put("dayOfWeek", Map.of("type", "integer", "example", 1));
                properties.put("startTime", Map.of("type", "string", "example", "08:00:00"));
                properties.put("endTime", Map.of("type", "string", "example", "17:00:00"));
                properties.put("minEmployeesRequired", Map.of("type", "integer", "example", 2));
                break;
            case "CheckInResponse":
                properties.put("message", Map.of("type", "string", "example", "Ponto registrado com sucesso dentro da área permitida"));
                break;
            case "EscalaResponse":
                properties.put("id", Map.of("type", "integer", "example", 101));
                properties.put("employeeId", Map.of("type", "integer", "example", 1));
                properties.put("shiftDate", Map.of("type", "string", "example", "2026-06-20"));
                properties.put("startTime", Map.of("type", "string", "example", "08:00:00"));
                properties.put("endTime", Map.of("type", "string", "example", "17:00:00"));
                properties.put("workMode", Map.of("type", "string", "example", "PRESENCIAL"));
                properties.put("padraoEscala", Map.of("type", "string", "example", "COMUM"));
                properties.put("notes", Map.of("type", "string", "example", "Plantão"));
                properties.put("sectorId", Map.of("type", "integer", "example", 1));
                properties.put("projectId", Map.of("type", "integer", "example", 1));
                properties.put("version", Map.of("type", "integer", "example", 0));
                break;
            case "ShiftSwapResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("requesterId", Map.of("type", "integer", "example", 1));
                properties.put("originalShiftId", Map.of("type", "integer", "example", 101));
                properties.put("compensationDate", Map.of("type", "string", "example", "2026-06-25"));
                properties.put("comments", Map.of("type", "string", "example", "Troca"));
                properties.put("status", Map.of("type", "string", "example", "SOLICITADO"));
                break;
            case "CheckoutResponse":
                properties.put("url", Map.of("type", "string", "example", "https://checkout.stripe.com/..."));
                break;
            case "SubscriptionResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("status", Map.of("type", "string", "example", "ACTIVE"));
                properties.put("planType", Map.of("type", "string", "example", "TRIAL"));
                properties.put("stripeSubscriptionId", Map.of("type", "string", "example", "sub_123"));
                break;
            case "LearningProgressResponse":
                properties.put("id", Map.of("type", "integer", "example", 1));
                properties.put("module", Map.of("type", "string", "example", "Treinamento"));
                properties.put("topic", Map.of("type", "string", "example", "escala"));
                properties.put("completed", Map.of("type", "boolean", "example", true));
                break;
            case "PayrollResponse":
                properties.put("month", Map.of("type", "string", "example", "2026-06"));
                properties.put("totalHours", Map.of("type", "integer", "example", 160));
                properties.put("totalEmployees", Map.of("type", "integer", "example", 10));
                break;
            case "StatsResponse":
                properties.put("activeEmployees", Map.of("type", "integer", "example", 50));
                properties.put("totalSectors", Map.of("type", "integer", "example", 5));
                properties.put("totalProjects", Map.of("type", "integer", "example", 3));
                break;
            case "WebhookResponse":
                properties.put("status", Map.of("type", "string", "example", "success"));
                properties.put("action", Map.of("type", "string", "example", "SUGGEST_REPLACEMENT"));
                properties.put("response", Map.of("type", "string", "example", "Olá! Analisamos a mensagem..."));
                properties.put("suggestions", Map.of("type", "array", "items", Map.of("type", "string"), "example", List.of("João Silva (joao@escala.local)")));
                break;
            default:
                schema.put("description", "Retorno " + responseName + ". Consulte os DTOs/Entities Java do backend.");
                return schema;
        }

        schema.put("properties", properties);
        return schema;
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
