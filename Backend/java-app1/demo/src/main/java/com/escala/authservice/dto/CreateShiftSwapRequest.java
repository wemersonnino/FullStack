package com.escala.authservice.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateShiftSwapRequest {
    private Long requesterId;
    private Long originalShiftId;
    private LocalDate compensationDate;
    private String comments;
}
