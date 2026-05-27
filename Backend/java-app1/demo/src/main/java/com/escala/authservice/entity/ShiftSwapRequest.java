package com.escala.authservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "shift_swap_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShiftSwapRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Employee requester;

    @ManyToOne(optional = false)
    private WorkShift originalShift;

    private LocalDate compensationDate;

    private String comments;

    private String adminComments;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SwapStatus status = SwapStatus.PENDING;

    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    private OffsetDateTime decidedAt;
}
