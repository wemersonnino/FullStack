package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ai_usage_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiUsage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User user;

    @ManyToOne(optional = false)
    private Company company;

    @Column(nullable = false)
    private String feature; // ex: SUGGEST_REPLACEMENT, RISK_ANALYSIS

    @Column(nullable = false)
    private OffsetDateTime usedAt;

    private Integer tokensUsed;
    private Integer creditsConsumed;
    
    @Column(columnDefinition = "TEXT")
    private String promptRef; // Referência ou resumo do que foi solicitado
}
