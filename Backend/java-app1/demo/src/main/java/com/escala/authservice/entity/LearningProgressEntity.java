package com.escala.authservice.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "learning_progress")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningProgressEntity {
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    private String module;
    private String topic;
    private boolean completed;
    private OffsetDateTime completionDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
