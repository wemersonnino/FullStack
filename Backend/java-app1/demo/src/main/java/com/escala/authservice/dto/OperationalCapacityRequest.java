package com.escala.authservice.dto;

import lombok.Data;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class OperationalCapacityRequest {
    private UUID targetId;
    private String targetType; // "SECTOR" ou "WORK_POST"
    private Integer dayOfWeek; // 1 = Segunda, 7 = Domingo
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer minEmployeesRequired;
}
