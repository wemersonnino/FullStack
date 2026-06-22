package com.escala.authservice.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class OperationalCapacityRequest {
    private Long targetId;
    private String targetType; // "SECTOR" ou "WORK_POST"
    private Integer dayOfWeek; // 1 = Segunda, 7 = Domingo
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer minEmployeesRequired;
}
