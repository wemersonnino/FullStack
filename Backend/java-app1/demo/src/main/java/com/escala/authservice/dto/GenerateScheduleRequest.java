package com.escala.authservice.dto;

import lombok.Data;

import java.time.LocalTime;
import java.util.UUID;
import java.util.List;
import com.escala.authservice.entity.WorkMode;

@Data
public class GenerateScheduleRequest {
    private int year;
    private int month;
    private LocalTime startTime = LocalTime.of(8, 0);
    private LocalTime endTime = LocalTime.of(17, 0);
    private WorkMode workMode = WorkMode.PRESENCIAL;
    private Integer maxPresentialPerDay;
    private List<UUID> employeeIds;
}
