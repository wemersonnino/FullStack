package com.escala.authservice.controller;

import com.escala.authservice.core.contact.domain.ContactMessage;
import com.escala.authservice.core.contact.usecase.SubmitContactUseCase;
import com.escala.authservice.service.PublicEndpointProtectionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/contact")
@RequiredArgsConstructor
public class ContactController {
    private final SubmitContactUseCase submitContactUseCase;
    private final PublicEndpointProtectionService publicEndpointProtectionService;

    @PostMapping
    public ResponseEntity<Void> submit(@RequestBody ContactRequest request, HttpServletRequest servletRequest) {
        publicEndpointProtectionService.protectContact(
                servletRequest,
                request.email(),
                request.subject(),
                request.recaptchaToken()
        );

        ContactMessage message = ContactMessage.builder()
                .name(request.name())
                .email(request.email())
                .subject(request.subject())
                .message(request.message())
                .build();
        
        submitContactUseCase.execute(message);
        return ResponseEntity.ok().build();
    }

    public record ContactRequest(String name, String email, String subject, String message, String recaptchaToken) {}
}
