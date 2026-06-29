package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.ScheduleCycleRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleStatus;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleCycleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleCycleServiceTest {
    @Mock
    private ScheduleCycleRepository scheduleCycleRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ScheduleCycleService service;

    @Test
    void criaCicloMensalEmRascunhoParaEmpresaDoUsuario() {
        when(currentUserService.requireCurrentUser("admin@escala.local")).thenReturn(requester());
        when(scheduleCycleRepository.findActiveForPeriod(new UUID(0L, 1L), new UUID(0L, 10L), 2026, 6, ScheduleCycleStatus.ARQUIVADO))
                .thenReturn(Optional.empty());
        when(scheduleCycleRepository.save(any(ScheduleCycle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleCycle cycle = service.createCycle(
                "admin@escala.local",
                new ScheduleCycleRequest(2026, 6, new UUID(0L, 10L), "America/Sao_Paulo")
        );

        ArgumentCaptor<ScheduleCycle> captor = ArgumentCaptor.forClass(ScheduleCycle.class);
        verify(scheduleCycleRepository).save(captor.capture());
        assertEquals(new UUID(0L, 1L), captor.getValue().getCompany().getId());
        assertEquals(ScheduleCycleStatus.RASCUNHO, cycle.getStatus());
        assertEquals(1, cycle.getBusinessVersion());
        assertEquals("America/Sao_Paulo", cycle.getTimezone());
        assertEquals(captor.getValue().getPublicId(), cycle.getPublicId());
    }

    @Test
    void usaTimezonePadraoQuandoNaoInformado() {
        when(currentUserService.requireCurrentUser("admin@escala.local")).thenReturn(requester());
        when(scheduleCycleRepository.findActiveForPeriod(new UUID(0L, 1L), null, 2026, 7, ScheduleCycleStatus.ARQUIVADO))
                .thenReturn(Optional.empty());
        when(scheduleCycleRepository.save(any(ScheduleCycle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleCycle cycle = service.createCycle("admin@escala.local", new ScheduleCycleRequest(2026, 7, null, " "));

        assertEquals("America/Sao_Paulo", cycle.getTimezone());
    }

    @Test
    void rejeitaCicloDuplicadoAtivoNoMesmoPeriodo() {
        when(currentUserService.requireCurrentUser("admin@escala.local")).thenReturn(requester());
        when(scheduleCycleRepository.findActiveForPeriod(new UUID(0L, 1L), new UUID(0L, 10L), 2026, 6, ScheduleCycleStatus.ARQUIVADO))
                .thenReturn(Optional.of(ScheduleCycle.builder().id(new UUID(0L, 99L)).build()));

        assertThrows(IllegalStateException.class, () -> service.createCycle(
                "admin@escala.local",
                new ScheduleCycleRequest(2026, 6, new UUID(0L, 10L), "America/Sao_Paulo")
        ));
    }

    @Test
    void buscaCicloSomenteNaEmpresaDoUsuario() {
        when(currentUserService.requireCurrentUser("admin@escala.local")).thenReturn(requester());
        UUID publicId = UUID.randomUUID();
        ScheduleCycle existing = ScheduleCycle.builder().id(new UUID(0L, 5L)).publicId(publicId).year(2026).month(6).build();
        when(scheduleCycleRepository.findByCompanyIdAndPublicId(new UUID(0L, 1L), publicId)).thenReturn(Optional.of(existing));

        ScheduleCycle cycle = service.getCycle("admin@escala.local", publicId);

        assertEquals(publicId, cycle.getPublicId());
    }

    @Test
    void rejeitaMesInvalido() {
        when(currentUserService.requireCurrentUser("admin@escala.local")).thenReturn(requester());

        assertThrows(IllegalArgumentException.class, () -> service.createCycle(
                "admin@escala.local",
                new ScheduleCycleRequest(2026, 13, null, "America/Sao_Paulo")
        ));
    }

    private User requester() {
        return User.builder()
                .email("admin@escala.local")
                .company(Company.builder().id(new UUID(0L, 1L)).name("Escala Demo").slug("escala-demo").build())
                .build();
    }
}
