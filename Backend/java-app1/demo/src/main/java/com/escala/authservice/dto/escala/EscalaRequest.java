package com.escala.authservice.dto.escala;

import com.escala.authservice.entity.WorkMode;
import com.escala.authservice.scheduling.domain.enums.PadraoEscala;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class EscalaRequest {
    private Long employeeId;
    private Long companyId;
    private Long sectorId;
    private Long projectId;
    private List<LocalDate> dates;
    private LocalTime startTime;
    private LocalTime endTime;
    private WorkMode workMode;
    private PadraoEscala padraoEscala;
    private String location;
    private String sector;
    private String project;
    private String notes;
}
