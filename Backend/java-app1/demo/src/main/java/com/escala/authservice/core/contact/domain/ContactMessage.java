package com.escala.authservice.core.contact.domain;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class ContactMessage {
    private String name;
    private String email;
    private String subject;
    private String message;
    private OffsetDateTime sentAt;
}
