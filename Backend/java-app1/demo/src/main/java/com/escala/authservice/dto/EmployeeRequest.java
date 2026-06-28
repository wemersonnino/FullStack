package com.escala.authservice.dto;

import java.util.UUID;

import lombok.Data;

@Data
public class EmployeeRequest {
    private String fullName;
    private String email;
    private Boolean active;
    private UUID sectorId;
    private UUID projectId;
}
