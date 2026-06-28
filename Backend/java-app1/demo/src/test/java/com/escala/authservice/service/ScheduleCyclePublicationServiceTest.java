package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.CycleValidationAlertResponse;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleStatus;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleCycleRepository;
import com.escala.authservice.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleCyclePublicationServiceTest {
    @Mock
    private ScheduleCycleService scheduleCycleService;

    @Mock
    private ScheduleCycleValidationService validationService;

    @Mock
    private ScheduleCycleRepository scheduleCycleRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ScheduleCyclePublicationService service;

    @Test
    void bloqueiaPublicacaoComAlertaCriticoSemCiencia() {
        UUID cyclePublicId = UUID.randomUUID();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId))
                .thenReturn(cycle(cyclePublicId, ScheduleCycleStatus.RASCUNHO));
        when(validationService.validateCycle("admin@escala.local", cyclePublicId))
                .thenReturn(List.of(alert("CRITICAL", false)));

        assertThrows(IllegalStateException.class, () -> service.publish("admin@escala.local", cyclePublicId));
        verify(scheduleCycleRepository, never()).save(any());
    }

    @Test
    void publicaCicloComAlertasCriticosComCiencia() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.EM_VALIDACAO);
        User requester = requester();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(validationService.validateCycle("admin@escala.local", cyclePublicId))
                .thenReturn(List.of(alert("CRITICAL", true)));
        when(userRepository.findByEmail("admin@escala.local")).thenReturn(Optional.of(requester));
        when(scheduleCycleRepository.save(any(ScheduleCycle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleCycle published = service.publish("admin@escala.local", cyclePublicId);

        assertEquals(ScheduleCycleStatus.PUBLICADO, published.getStatus());
        assertEquals(requester, published.getPublishedBy());
        assertNotNull(published.getPublishedAt());
    }

    @Test
    void publicacaoJaPublicadaEIdempotente() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.PUBLICADO);
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);

        ScheduleCycle published = service.publish("admin@escala.local", cyclePublicId);

        assertEquals(ScheduleCycleStatus.PUBLICADO, published.getStatus());
        verify(scheduleCycleRepository, never()).save(any());
    }

    @Test
    void abreRetificacaoDeCicloPublicadoIncrementandoVersao() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.PUBLICADO);
        cycle.setBusinessVersion(2);
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(scheduleCycleRepository.save(any(ScheduleCycle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleCycle rectified = service.rectify("admin@escala.local", cyclePublicId);

        assertEquals(ScheduleCycleStatus.RETIFICADO, rectified.getStatus());
        assertEquals(3, rectified.getBusinessVersion());
    }

    @Test
    void retificacaoJaRetificadaEIdempotente() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.RETIFICADO);
        cycle.setBusinessVersion(2);
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);

        ScheduleCycle rectified = service.rectify("admin@escala.local", cyclePublicId);

        assertEquals(ScheduleCycleStatus.RETIFICADO, rectified.getStatus());
        assertEquals(2, rectified.getBusinessVersion());
        verify(scheduleCycleRepository, never()).save(any());
    }

    @Test
    void bloqueiaRetificacaoDeRascunho() {
        UUID cyclePublicId = UUID.randomUUID();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId))
                .thenReturn(cycle(cyclePublicId, ScheduleCycleStatus.RASCUNHO));

        assertThrows(IllegalStateException.class, () -> service.rectify("admin@escala.local", cyclePublicId));
        verify(scheduleCycleRepository, never()).save(any());
    }

    @Test
    void arquivaCicloPublicado() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.PUBLICADO);
        User requester = requester();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(userRepository.findByEmail("admin@escala.local")).thenReturn(Optional.of(requester));
        when(scheduleCycleRepository.save(any(ScheduleCycle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleCycle archived = service.archive("admin@escala.local", cyclePublicId);

        assertEquals(ScheduleCycleStatus.ARQUIVADO, archived.getStatus());
        assertEquals(requester, archived.getArchivedBy());
        assertNotNull(archived.getArchivedAt());
    }

    @Test
    void bloqueiaArquivamentoDeRascunho() {
        UUID cyclePublicId = UUID.randomUUID();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId))
                .thenReturn(cycle(cyclePublicId, ScheduleCycleStatus.RASCUNHO));

        assertThrows(IllegalStateException.class, () -> service.archive("admin@escala.local", cyclePublicId));
        verify(scheduleCycleRepository, never()).save(any());
    }

    @Test
    void arquivamentoJaArquivadoEIdempotente() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.ARQUIVADO);
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);

        ScheduleCycle archived = service.archive("admin@escala.local", cyclePublicId);

        assertEquals(ScheduleCycleStatus.ARQUIVADO, archived.getStatus());
        verify(scheduleCycleRepository, never()).save(any());
    }

    private CycleValidationAlertResponse alert(String severity, boolean acknowledged) {
        return new CycleValidationAlertResponse(
                UUID.randomUUID().toString(),
                severity,
                "RULE",
                "Mensagem",
                null,
                null,
                null,
                acknowledged,
                null
        );
    }

    private ScheduleCycle cycle(UUID publicId, ScheduleCycleStatus status) {
        return ScheduleCycle.builder()
                .id(new UUID(0L, 5L))
                .publicId(publicId)
                .company(Company.builder().id(new UUID(0L, 1L)).name("Escala Demo").slug("escala-demo").build())
                .year(2026)
                .month(6)
                .timezone("America/Sao_Paulo")
                .status(status)
                .build();
    }

    private User requester() {
        return User.builder()
                .id(new UUID(0L, 9L))
                .email("admin@escala.local")
                .username("admin")
                .company(Company.builder().id(new UUID(0L, 1L)).name("Escala Demo").slug("escala-demo").build())
                .build();
    }
}
