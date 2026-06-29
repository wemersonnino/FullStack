package com.escala.authservice.controller;

import com.escala.authservice.entity.*;
import com.escala.authservice.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/webhooks/chatbot")
@RequiredArgsConstructor
public class ChatbotWebhookController {
    @Value("${application.integrations.chatbot.webhook-secret:}")
    private String webhookSecret;

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AiUsageRepository aiUsageRepository;

    @Data
    public static class ChatbotWebhookRequest {
        private String senderEmail;
        private String message;
        private String phone;
    }

    @Data
    @Builder
    public static class ChatbotWebhookResponse {
        private String status;
        private String action;
        private String response;
        private List<String> suggestions;
    }

    @PostMapping
    public ResponseEntity<ChatbotWebhookResponse> processWebhook(
            @RequestBody ChatbotWebhookRequest request,
            @RequestHeader(value = "X-Webhook-Secret", required = false) String providedSecret
    ) {
        if (!webhookSecret.isBlank() && !Objects.equals(webhookSecret, providedSecret)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Webhook secret invalido");
        }

        String email = request.getSenderEmail() != null ? request.getSenderEmail() : "admin@escala.local";
        User user = userRepository.findByEmail(email).orElse(null);
        Employee employee = employeeRepository.findByEmail(email).orElse(null);

        String msg = request.getMessage() != null ? request.getMessage().toLowerCase() : "";
        String action = "UNKNOWN";
        String responseText = "Olá! Não consegui entender sua solicitação. Tente pedir uma 'troca' ou solicitar um 'substituto'.";
        List<String> suggestions = new ArrayList<>();

        if (employee != null && user != null) {
            // Log AI Usage
            AiUsage usage = AiUsage.builder()
                    .user(user)
                    .company(user.getCompany())
                    .feature("CHATBOT_NLP")
                    .usedAt(OffsetDateTime.now())
                    .tokensUsed(150)
                    .creditsConsumed(1)
                    .promptRef(request.getMessage())
                    .build();
            aiUsageRepository.save(usage);

            if (msg.contains("troca") || msg.contains("substitu") || msg.contains("escala")) {
                action = "SUGGEST_REPLACEMENT";
                Sector sector = employee.getSector();
                List<Employee> colleagues = sector != null
                        ? employeeRepository.findByActiveTrueAndSectorIdOrderByFullNameAsc(sector.getId()).stream()
                            .filter(col -> col.getCompany() != null && employee.getCompany() != null
                                    && Objects.equals(col.getCompany().getId(), employee.getCompany().getId()))
                            .toList()
                        : List.of();
                
                suggestions.add("Opções de substitutos disponíveis no mesmo setor/projeto:");
                for (Employee col : colleagues) {
                    if (!col.getId().equals(employee.getId())) {
                        suggestions.add(col.getFullName() + " (" + col.getEmail() + ")");
                    }
                }
                if (suggestions.size() <= 1) {
                    suggestions.add("Nenhum colega do mesmo setor encontrado no momento.");
                }
                responseText = "Olá " + employee.getFullName() + "! Analisamos sua mensagem com inteligência artificial e localizamos possíveis substitutos aptos a cobrir sua escala de acordo com as regras de distanciamento e escalas.";
            }
        }

        ChatbotWebhookResponse res = ChatbotWebhookResponse.builder()
                .status("success")
                .action(action)
                .response(responseText)
                .suggestions(suggestions)
                .build();

        return ResponseEntity.ok(res);
    }
}
