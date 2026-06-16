package com.escala.authservice.controller;

import com.escala.authservice.core.ai.usecase.AiAssistantUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiAssistantUseCase aiAssistantUseCase;

    @PostMapping("/suggest-replacement")
    public ResponseEntity<Map<String, String>> suggestReplacement(
            Authentication authentication,
            @RequestBody Map<String, Object> context
    ) {
        String instruction = "Sugira um colaborador substituto qualificado para este turno vago, considerando proximidade e regras de descanso.";
        String response = aiAssistantUseCase.executeAiTask(authentication.getName(), "SUGGEST_REPLACEMENT", context, instruction);
        return ResponseEntity.ok(Map.of("suggestion", response));
    }

    @PostMapping("/analyze-risk")
    public ResponseEntity<Map<String, String>> analyzeRisk(
            Authentication authentication,
            @RequestBody Map<String, Object> context
    ) {
        String instruction = "Analise os riscos de cobertura para a próxima semana e identifique possíveis gargalos ou excesso de horas extras.";
        String response = aiAssistantUseCase.executeAiTask(authentication.getName(), "RISK_ANALYSIS", context, instruction);
        return ResponseEntity.ok(Map.of("analysis", response));
    }

    @PostMapping("/explain-conflict")
    public ResponseEntity<Map<String, String>> explainConflict(
            Authentication authentication,
            @RequestBody Map<String, Object> context
    ) {
        String instruction = "Explique por que esta escala está gerando um conflito trabalhista de forma clara para o gestor.";
        String response = aiAssistantUseCase.executeAiTask(authentication.getName(), "EXPLAIN_CONFLICT", context, instruction);
        return ResponseEntity.ok(Map.of("explanation", response));
    }
}
