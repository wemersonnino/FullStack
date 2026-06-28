package com.escala.authservice.dto.scheduling;

import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;

import java.time.LocalDate;
import java.util.UUID;

public record CycleAssignmentItemRequest(
        UUID employeeId,
        LocalDate date,
        String legendCode,
        ModalidadeTrabalho modality
) {
}
