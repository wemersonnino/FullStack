package com.escala.authservice.scheduling.domain.monthly;

import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;

import java.time.LocalDate;
import java.util.Objects;

public record ScheduleAssignment(
        Long employeeId,
        LocalDate date,
        LegendCode legend,
        ModalidadeTrabalho modality
) {
    public ScheduleAssignment {
        Objects.requireNonNull(employeeId, "employeeId is required");
        Objects.requireNonNull(date, "date is required");
        Objects.requireNonNull(legend, "legend is required");
        modality = modality == null ? ModalidadeTrabalho.PRESENCIAL : modality;
    }
}
