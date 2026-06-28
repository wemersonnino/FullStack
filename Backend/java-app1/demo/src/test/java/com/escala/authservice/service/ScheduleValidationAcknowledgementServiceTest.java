package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.AcknowledgeValidationAlertRequest;
import com.escala.authservice.dto.scheduling.CycleValidationAlertResponse;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleValidationAcknowledgement;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleValidationAcknowledgementRepository;
import com.escala.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleValidationAcknowledgementServiceTest {
    @Mock
    private ScheduleCycleService scheduleCycleService;

    @Mock
    private ScheduleCycleValidationService validationService;

    @Mock
    private ScheduleValidationAcknowledgementRepository acknowledgementRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ScheduleValidationAcknowledgementService service;

    @Test
    void registraCienciaDeAlertaExistente() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId);
        User requester = requester();
        CycleValidationAlertResponse alert = alert("alert-1", "CRITICAL", "EMPTY_CYCLE");
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(userRepository.findByEmail("admin@escala.local")).thenReturn(Optional.of(requester));
        when(validationService.validateCycle("admin@escala.local", cyclePublicId)).thenReturn(List.of(alert));
        when(acknowledgementRepository.findByCycleIdAndAlertId(5L, "alert-1")).thenReturn(Optional.empty());
        when(acknowledgementRepository.save(any(ScheduleValidationAcknowledgement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleValidationAcknowledgement acknowledgement = service.acknowledge(
                "admin@escala.local",
                cyclePublicId,
                "alert-1",
                new AcknowledgeValidationAlertRequest(" Ciente ")
        );

        ArgumentCaptor<ScheduleValidationAcknowledgement> captor =
                ArgumentCaptor.forClass(ScheduleValidationAcknowledgement.class);
        verify(acknowledgementRepository).save(captor.capture());
        assertEquals(cycle, captor.getValue().getCycle());
        assertEquals("alert-1", acknowledgement.getAlertId());
        assertEquals("Ciente", acknowledgement.getReason());
        assertEquals("admin@escala.local", acknowledgement.getAcknowledgedBy().getEmail());
    }

    @Test
    void rejeitaCienciaDeAlertaInexistenteNoCicloAtual() {
        UUID cyclePublicId = UUID.randomUUID();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle(cyclePublicId));
        when(userRepository.findByEmail("admin@escala.local")).thenReturn(Optional.of(requester()));
        when(validationService.validateCycle("admin@escala.local", cyclePublicId)).thenReturn(List.of());

        assertThrows(IllegalArgumentException.class, () -> service.acknowledge(
                "admin@escala.local",
                cyclePublicId,
                "missing",
                new AcknowledgeValidationAlertRequest(null)
        ));
    }

    @Test
    void atualizaCienciaExistente() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId);
        User requester = requester();
        CycleValidationAlertResponse alert = alert("alert-1", "WARNING", "WEEKEND_WORK");
        ScheduleValidationAcknowledgement existing = ScheduleValidationAcknowledgement.builder()
                .cycle(cycle)
                .alertId("alert-1")
                .ruleCode("WEEKEND_WORK")
                .severity("WARNING")
                .acknowledgedBy(requester)
                .reason("antes")
                .build();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(userRepository.findByEmail("admin@escala.local")).thenReturn(Optional.of(requester));
        when(validationService.validateCycle("admin@escala.local", cyclePublicId)).thenReturn(List.of(alert));
        when(acknowledgementRepository.findByCycleIdAndAlertId(5L, "alert-1")).thenReturn(Optional.of(existing));
        when(acknowledgementRepository.save(any(ScheduleValidationAcknowledgement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleValidationAcknowledgement acknowledgement = service.acknowledge(
                "admin@escala.local",
                cyclePublicId,
                "alert-1",
                new AcknowledgeValidationAlertRequest("depois")
        );

        assertEquals("depois", acknowledgement.getReason());
    }

    private ScheduleCycle cycle(UUID publicId) {
        return ScheduleCycle.builder()
                .id(5L)
                .publicId(publicId)
                .company(Company.builder().id(1L).name("Escala Demo").slug("escala-demo").build())
                .year(2026)
                .month(6)
                .timezone("America/Sao_Paulo")
                .build();
    }

    private User requester() {
        return User.builder()
                .id(9L)
                .email("admin@escala.local")
                .username("admin")
                .company(Company.builder().id(1L).name("Escala Demo").slug("escala-demo").build())
                .build();
    }

    private CycleValidationAlertResponse alert(String id, String severity, String ruleCode) {
        return new CycleValidationAlertResponse(
                id,
                severity,
                ruleCode,
                "Mensagem",
                null,
                null,
                LocalDate.of(2026, 6, 1),
                false,
                null
        );
    }
}
