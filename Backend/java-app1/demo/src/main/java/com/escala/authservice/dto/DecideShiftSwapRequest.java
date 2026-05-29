package com.escala.authservice.dto;

import lombok.Data;

@Data
public class DecideShiftSwapRequest {
    private boolean approved;
    private String adminComments;
    private boolean effective = true;
}
