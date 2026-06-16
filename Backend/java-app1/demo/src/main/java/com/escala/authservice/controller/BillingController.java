package com.escala.authservice.controller;

import com.escala.authservice.core.billing.usecase.BillingService;
import com.escala.authservice.entity.Subscription;
import com.escala.authservice.entity.User;
import com.escala.authservice.service.UserManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;
    private final UserManagementService userManagementService;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            Authentication authentication,
            @RequestBody Map<String, String> request
    ) {
        User user = userManagementService.currentUser(authentication.getName());
        String planType = request.get("planType");
        String successUrl = request.get("successUrl");
        String cancelUrl = request.get("cancelUrl");

        String checkoutUrl = billingService.createCheckoutSession(user.getCompany().getId(), planType, successUrl, cancelUrl);
        return ResponseEntity.ok(Map.of("url", checkoutUrl));
    }

    @GetMapping("/subscription")
    public ResponseEntity<Subscription> getSubscription(Authentication authentication) {
        User user = userManagementService.currentUser(authentication.getName());
        return billingService.getSubscription(user.getCompany().getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/cancel")
    public ResponseEntity<Void> cancelSubscription(Authentication authentication) {
        User user = userManagementService.currentUser(authentication.getName());
        billingService.cancelSubscription(user.getCompany().getId());
        return ResponseEntity.noContent().build();
    }
}
