package com.escala.authservice.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class PayrollReportItem {
    private String employeeName;
    private String employeeEmail;
    private Long totalHours;
    private Long extraHours;
    private Long nightHours;
    private Long absences;
    private BigDecimal estimatedCost; // Mock calculation
    private String period;
}
