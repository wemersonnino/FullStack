package com.escala.authservice.core.scheduling.domain;

import com.escala.authservice.entity.ShiftStatus;
import com.escala.authservice.entity.WorkMode;
import com.escala.authservice.scheduling.domain.enums.PadraoEscala;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class WorkShiftDomain {
    private Long id;
    private Long employeeId;
    private Long companyId;
    private LocalDate shiftDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private ShiftStatus status;
    private WorkMode workMode;
    private PadraoEscala padraoEscala;
    private String notes;
}
