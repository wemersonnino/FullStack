package com.escala.authservice.controller;

import com.escala.authservice.core.contact.domain.ContactMessage;
import com.escala.authservice.core.contact.usecase.SubmitContactUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/contact")
@RequiredArgsConstructor
public class ContactController {
    private final SubmitContactUseCase submitContactUseCase;

    @PostMapping
    public ResponseEntity<Void> submit(@RequestBody ContactRequest request) {
        ContactMessage message = ContactMessage.builder()
                .name(request.name())
                .email(request.email())
                .subject(request.subject())
                .message(request.message())
                .build();
        
        submitContactUseCase.execute(message);
        return ResponseEntity.ok().build();
    }

    public record ContactRequest(String name, String email, String subject, String message) {}
}
