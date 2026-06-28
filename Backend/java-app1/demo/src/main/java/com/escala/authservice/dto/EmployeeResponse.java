package com.escala.authservice.dto;

import com.escala.authservice.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {
    private String id;
    private String fullName;
    private String email;
    private boolean active;
    private String sectorId;
    private String sectorName;
    private String projectId;
    private String projectName;
    private String userId;

    public static EmployeeResponse from(Employee employee) {
        if (employee == null) return null;
        return EmployeeResponse.builder()
                .id(employee.getPublicId().toString())
                .fullName(employee.getFullName())
                .email(employee.getEmail())
                .active(employee.isActive())
                .sectorId(employee.getSector() != null ? employee.getSector().getId().toString() : null)
                .sectorName(employee.getSector() != null ? employee.getSector().getName() : null)
                .projectId(employee.getProject() != null ? employee.getProject().getId().toString() : null)
                .projectName(employee.getProject() != null ? employee.getProject().getName() : null)
                .userId(employee.getUser() != null ? employee.getUser().getId().toString() : null)
                .build();
    }
}
