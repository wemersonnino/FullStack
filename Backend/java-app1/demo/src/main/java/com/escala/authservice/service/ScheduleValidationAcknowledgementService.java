package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.AcknowledgeValidationAlertRequest;
import com.escala.authservice.dto.scheduling.CycleValidationAlertResponse;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleValidationAcknowledgement;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleValidationAcknowledgementRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScheduleValidationAcknowledgementService {
    private final ScheduleCycleService scheduleCycleService;
    private final ScheduleCycleValidationService validationService;
    private final ScheduleValidationAcknowledgementRepository acknowledgementRepository;
    private final UserRepository userRepository;

    @Transactional
    public ScheduleValidationAcknowledgement acknowledge(
            String email,
            UUID cyclePublicId,
            String alertId,
            AcknowledgeValidationAlertRequest request
    ) {
        if (alertId == null || alertId.isBlank()) {
            throw new IllegalArgumentException("ID do alerta e obrigatorio");
        }
        ScheduleCycle cycle = scheduleCycleService.getCycle(email, cyclePublicId);
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        CycleValidationAlertResponse alert = validationService.validateCycle(email, cyclePublicId).stream()
                .filter(candidate -> candidate.id().equals(alertId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Alerta de validacao nao encontrado no ciclo atual"));

        return acknowledgementRepository.findByCycleIdAndAlertId(cycle.getId(), alertId)
                .map(existing -> update(existing, requester, request))
                .orElseGet(() -> create(cycle, requester, alert, request));
    }

    private ScheduleValidationAcknowledgement create(
            ScheduleCycle cycle,
            User requester,
            CycleValidationAlertResponse alert,
            AcknowledgeValidationAlertRequest request
    ) {
        ScheduleValidationAcknowledgement acknowledgement = ScheduleValidationAcknowledgement.builder()
                .cycle(cycle)
                .alertId(alert.id())
                .ruleCode(alert.ruleCode())
                .severity(alert.severity())
                .acknowledgedBy(requester)
                .reason(normalizeReason(request))
                .acknowledgedAt(OffsetDateTime.now())
                .build();
        return acknowledgementRepository.save(acknowledgement);
    }

    private ScheduleValidationAcknowledgement update(
            ScheduleValidationAcknowledgement acknowledgement,
            User requester,
            AcknowledgeValidationAlertRequest request
    ) {
        acknowledgement.setAcknowledgedBy(requester);
        acknowledgement.setReason(normalizeReason(request));
        acknowledgement.setAcknowledgedAt(OffsetDateTime.now());
        return acknowledgementRepository.save(acknowledgement);
    }

    private String normalizeReason(AcknowledgeValidationAlertRequest request) {
        if (request == null || request.reason() == null || request.reason().isBlank()) {
            return null;
        }
        return request.reason().trim();
    }
}
