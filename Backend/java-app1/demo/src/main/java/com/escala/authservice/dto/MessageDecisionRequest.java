package com.escala.authservice.dto;

import lombok.Data;

@Data
public class MessageDecisionRequest {
    private String decision; // APPROVED or REJECTED
}
