package com.escala.authservice.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateShiftSwapRequest {
    private UUID requesterId;
    private UUID originalShiftId;
    private LocalDate compensationDate;
    private String comments;
}
