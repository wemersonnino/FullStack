package com.escala.authservice.controller;

import com.escala.authservice.core.billing.usecase.BillingService;
import com.escala.authservice.dto.BillingCheckoutRequest;
import com.escala.authservice.dto.SubscriptionResponse;
import com.escala.authservice.entity.User;
import com.escala.authservice.service.PolicyService;
import com.escala.authservice.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final UserManagementService userManagementService;
    private final PolicyService policyService;

    @Value("${app.frontend.allowed-redirect-origins:http://localhost:3000}")
    private String allowedRedirectOrigins;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            Authentication authentication,
            @RequestBody BillingCheckoutRequest request
    ) {
        User user = userManagementService.currentUser(authentication.getName());
        policyService.requireOwnerOrAdmin(user, "Apenas OWNER ou ADMIN podem gerenciar billing");
        validateRedirectUrl(request.getSuccessUrl(), "successUrl");
        validateRedirectUrl(request.getCancelUrl(), "cancelUrl");

        String checkoutUrl = billingService.createCheckoutSession(
                user.getCompany().getId(),
                request.getPlanType(),
                request.getSuccessUrl(),
                request.getCancelUrl()
        );
        return ResponseEntity.ok(Map.of("url", checkoutUrl));
    }

    @GetMapping("/subscription")
    public ResponseEntity<SubscriptionResponse> getSubscription(Authentication authentication) {
        User user = userManagementService.currentUser(authentication.getName());
        policyService.requireOwnerOrAdmin(user, "Apenas OWNER ou ADMIN podem consultar billing");
        return billingService.getSubscription(user.getCompany().getId())
                .map(SubscriptionResponse::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelSubscription(Authentication authentication) {
        User user = userManagementService.currentUser(authentication.getName());
        policyService.requireOwnerOrAdmin(user, "Apenas OWNER ou ADMIN podem cancelar assinaturas");
        billingService.cancelSubscription(user.getCompany().getId());
        return ResponseEntity.noContent().build();
    }

    private void validateRedirectUrl(String rawUrl, String fieldName) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " obrigatoria");
        }

        URI uri;
        try {
            uri = new URI(rawUrl.trim());
        } catch (URISyntaxException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " invalida", exception);
        }

        if (!uri.isAbsolute() || uri.getHost() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " deve ser absoluta");
        }

        Set<String> allowed = Arrays.stream(allowedRedirectOrigins.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toSet());

        String normalized = uri.getScheme() + "://" + uri.getAuthority();
        if (!allowed.contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " fora da allowlist");
        }
    }
}
