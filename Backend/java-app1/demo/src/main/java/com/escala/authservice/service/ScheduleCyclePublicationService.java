package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.CycleValidationAlertResponse;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleStatus;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleCycleRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScheduleCyclePublicationService {
    private final ScheduleCycleService scheduleCycleService;
    private final ScheduleCycleValidationService validationService;
    private final ScheduleCycleRepository scheduleCycleRepository;
    private final UserRepository userRepository;

    @Transactional
    public ScheduleCycle publish(String email, UUID cyclePublicId) {
        ScheduleCycle cycle = scheduleCycleService.getCycle(email, cyclePublicId);
        if (cycle.getStatus() == ScheduleCycleStatus.PUBLICADO) {
            return cycle;
        }
        if (cycle.getStatus() != ScheduleCycleStatus.RASCUNHO && cycle.getStatus() != ScheduleCycleStatus.EM_VALIDACAO) {
            throw new IllegalStateException("Somente ciclos em rascunho ou validacao podem ser publicados");
        }

        List<CycleValidationAlertResponse> alerts = validationService.validateCycle(email, cyclePublicId);
        boolean hasUnacknowledgedCriticalAlert = alerts.stream()
                .anyMatch(alert -> "CRITICAL".equals(alert.severity()) && !alert.acknowledged());
        if (hasUnacknowledgedCriticalAlert) {
            throw new IllegalStateException("Existem alertas criticos sem ciencia antes da publicacao");
        }

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        cycle.setStatus(ScheduleCycleStatus.PUBLICADO);
        cycle.setPublishedAt(OffsetDateTime.now());
        cycle.setPublishedBy(requester);
        return scheduleCycleRepository.save(cycle);
    }

    @Transactional
    public ScheduleCycle rectify(String email, UUID cyclePublicId) {
        ScheduleCycle cycle = scheduleCycleService.getCycle(email, cyclePublicId);
        if (cycle.getStatus() == ScheduleCycleStatus.RETIFICADO) {
            return cycle;
        }
        if (cycle.getStatus() != ScheduleCycleStatus.PUBLICADO) {
            throw new IllegalStateException("Somente ciclos publicados podem entrar em retificacao");
        }

        cycle.setStatus(ScheduleCycleStatus.RETIFICADO);
        cycle.setBusinessVersion(cycle.getBusinessVersion() + 1);
        return scheduleCycleRepository.save(cycle);
    }

    @Transactional
    public ScheduleCycle archive(String email, UUID cyclePublicId) {
        ScheduleCycle cycle = scheduleCycleService.getCycle(email, cyclePublicId);
        if (cycle.getStatus() == ScheduleCycleStatus.ARQUIVADO) {
            return cycle;
        }
        if (cycle.getStatus() != ScheduleCycleStatus.PUBLICADO && cycle.getStatus() != ScheduleCycleStatus.RETIFICADO) {
            throw new IllegalStateException("Somente ciclos publicados ou retificados podem ser arquivados");
        }

        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        cycle.setStatus(ScheduleCycleStatus.ARQUIVADO);
        cycle.setArchivedAt(OffsetDateTime.now());
        cycle.setArchivedBy(requester);
        return scheduleCycleRepository.save(cycle);
    }
}
