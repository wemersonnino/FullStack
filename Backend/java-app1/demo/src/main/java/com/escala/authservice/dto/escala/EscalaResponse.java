package com.escala.authservice.dto.escala;

import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.WorkShift;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class EscalaResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String email;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String workMode;
    private String notes;
    private Long sectorId;
    private String sector;
    private Long projectId;
    private String project;
    private Long companyId;
    private String company;

    public static EscalaResponse from(WorkShift shift) {
        Employee employee = shift.getEmployee();
        return EscalaResponse.builder()
                .id(shift.getId())
                .employeeId(employee.getId())
                .employeeName(employee.getFullName())
                .email(employee.getEmail())
                .shiftDate(shift.getShiftDate())
                .startTime(shift.getStartTime())
                .endTime(shift.getEndTime())
                .status(shift.getStatus().name())
                .workMode(shift.getWorkMode().name())
                .notes(shift.getNotes())
                .sectorId(employee.getSector() == null ? null : employee.getSector().getId())
                .sector(employee.getSector() == null ? null : employee.getSector().getName())
                .projectId(employee.getProject() == null ? null : employee.getProject().getId())
                .project(employee.getProject() == null ? null : employee.getProject().getName())
                .companyId(employee.getCompany() == null ? null : employee.getCompany().getId())
                .company(employee.getCompany() == null ? null : employee.getCompany().getName())
                .build();
    }
}
