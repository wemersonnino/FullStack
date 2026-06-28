package com.escala.authservice.dto.escala;

import com.escala.authservice.entity.WorkMode;
import com.escala.authservice.scheduling.domain.enums.PadraoEscala;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;
import java.time.LocalTime;
import java.util.List;

@Data
public class EscalaRequest {
    private UUID employeeId;
    private UUID companyId;
    private UUID sectorId;
    private UUID projectId;
    private List<LocalDate> dates;
    private LocalTime startTime;
    private LocalTime endTime;
    private WorkMode workMode;
    private PadraoEscala padraoEscala;
    private String location;
    private String sector;
    private String project;
    private String notes;
    private Long version;
}
