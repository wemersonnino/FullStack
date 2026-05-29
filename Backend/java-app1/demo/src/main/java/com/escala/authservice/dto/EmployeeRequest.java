package com.escala.authservice.dto;

import lombok.Data;

@Data
public class EmployeeRequest {
    private String fullName;
    private String email;
    private Boolean active;
    private Long sectorId;
    private Long projectId;
}
