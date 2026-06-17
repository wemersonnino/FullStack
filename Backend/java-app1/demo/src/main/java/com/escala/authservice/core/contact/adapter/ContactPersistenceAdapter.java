package com.escala.authservice.core.contact.adapter;

import com.escala.authservice.core.contact.domain.ContactMessage;
import com.escala.authservice.core.contact.port.ContactOutputPort;
import com.escala.authservice.entity.ContactMessageEntity;
import com.escala.authservice.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ContactPersistenceAdapter implements ContactOutputPort {
    private final ContactMessageRepository repository;

    @Override
    public void save(ContactMessage message) {
        ContactMessageEntity entity = ContactMessageEntity.builder()
                .name(message.getName())
                .email(message.getEmail())
                .subject(message.getSubject())
                .message(message.getMessage())
                .sentAt(message.getSentAt())
                .build();
        repository.save(entity);
    }

    @Override
    public void sendEmail(ContactMessage message) {
        // Mock email sending
        log.info("Simulando envio de email para {}: Assunto: {}", message.getEmail(), message.getSubject());
    }
}
