package com.escala.authservice.dto.escala;

import com.escala.authservice.entity.Employee;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioEscalaResponse {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String role;
    private String cargo;
    private String departamento;
    private Long sectorId;
    private String sector;
    private Long projectId;
    private String project;
    private Long companyId;
    private String company;
    private Boolean remoto;
    private String tipoVinculo;

    public static UsuarioEscalaResponse from(Employee employee) {
        String role = employee.getUser() == null || employee.getUser().getRoles() == null
                ? "USER"
                : employee.getUser().getRoles().stream().findFirst().map(item -> item.getName()).orElse("USER");

        return UsuarioEscalaResponse.builder()
                .id(employee.getId())
                .fullName(employee.getFullName())
                .username(employee.getUser() == null ? null : employee.getUser().getUsername())
                .email(employee.getEmail())
                .role(role)
                .cargo("Colaborador")
                .departamento(employee.getSector() == null ? null : employee.getSector().getName())
                .sectorId(employee.getSector() == null ? null : employee.getSector().getId())
                .sector(employee.getSector() == null ? null : employee.getSector().getName())
                .projectId(employee.getProject() == null ? null : employee.getProject().getId())
                .project(employee.getProject() == null ? null : employee.getProject().getName())
                .companyId(employee.getCompany() == null ? null : employee.getCompany().getId())
                .company(employee.getCompany() == null ? null : employee.getCompany().getName())
                .remoto(false)
                .tipoVinculo("CLT")
                .build();
    }
}
