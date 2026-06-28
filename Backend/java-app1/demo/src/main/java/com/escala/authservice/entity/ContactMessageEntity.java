package com.escala.authservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "contact_messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessageEntity {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;
    
    private String name;
    private String email;
    private String subject;
    
    @Column(columnDefinition = "TEXT")
    private String message;
    
    private OffsetDateTime sentAt;
}
