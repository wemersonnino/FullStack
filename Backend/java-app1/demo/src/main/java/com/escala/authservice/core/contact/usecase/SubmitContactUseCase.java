package com.escala.authservice.core.contact.usecase;

import com.escala.authservice.core.contact.domain.ContactMessage;
import com.escala.authservice.core.contact.port.ContactOutputPort;
import lombok.RequiredArgsConstructor;

import java.time.OffsetDateTime;

@RequiredArgsConstructor
public class SubmitContactUseCase {
    private final ContactOutputPort contactOutputPort;

    public void execute(ContactMessage message) {
        // Business Logic: validation, formatting, enrichment
        if (message.getEmail() == null || !message.getEmail().contains("@")) {
            throw new IllegalArgumentException("Email inválido");
        }
        
        message.setSentAt(OffsetDateTime.now());
        
        // Orchestration
        contactOutputPort.save(message);
        contactOutputPort.sendEmail(message);
    }
}
