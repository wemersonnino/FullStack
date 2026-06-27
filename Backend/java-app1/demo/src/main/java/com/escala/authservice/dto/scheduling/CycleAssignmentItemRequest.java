package com.escala.authservice.dto.scheduling;

import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;

import java.time.LocalDate;

public record CycleAssignmentItemRequest(
        Long employeeId,
        LocalDate date,
        String legendCode,
        ModalidadeTrabalho modality
) {
}
