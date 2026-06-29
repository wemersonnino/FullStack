package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.HolidayRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.ScheduleHoliday;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleHolidayRepository;
import com.escala.authservice.scheduling.domain.monthly.Holiday;
import com.escala.authservice.scheduling.domain.monthly.HolidayType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleHolidayServiceTest {
    @Mock
    private ScheduleHolidayRepository scheduleHolidayRepository;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private ScheduleHolidayService service;

    @Test
    void criaFeriadoVinculadoAEmpresaDoUsuario() {
        User requester = requester();
        when(currentUserService.requireCurrentUser("admin@escala.local")).thenReturn(requester);
        when(scheduleHolidayRepository.save(any(ScheduleHoliday.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        HolidayRequest request = new HolidayRequest(
                LocalDate.of(2026, 12, 25),
                " Natal ",
                HolidayType.NATIONAL,
                new UUID(0L, 10L)
        );

        ScheduleHoliday holiday = service.createHoliday("admin@escala.local", request);

        ArgumentCaptor<ScheduleHoliday> captor = ArgumentCaptor.forClass(ScheduleHoliday.class);
        verify(scheduleHolidayRepository).save(captor.capture());
        assertEquals(new UUID(0L, 1L), captor.getValue().getCompany().getId());
        assertEquals("Natal", holiday.getName());
        assertEquals(HolidayType.NATIONAL, holiday.getType());
        assertEquals(new UUID(0L, 10L), holiday.getUnitId());
    }

    @Test
    void rejeitaFeriadoSemNome() {
        when(currentUserService.requireCurrentUser("admin@escala.local")).thenReturn(requester());
        HolidayRequest request = new HolidayRequest(LocalDate.of(2026, 1, 1), " ", HolidayType.NATIONAL, null);

        assertThrows(IllegalArgumentException.class, () -> service.createHoliday("admin@escala.local", request));
    }

    @Test
    void listaFeriadosDoMesParaAplicacaoNoCalendario() {
        when(currentUserService.requireCurrentUser("admin@escala.local")).thenReturn(requester());
        ScheduleHoliday holiday = ScheduleHoliday.builder()
                .holidayDate(LocalDate.of(2026, 6, 4))
                .name("Corpus Christi")
                .type(HolidayType.MUNICIPAL)
                .unitId(new UUID(0L, 10L))
                .build();
        when(scheduleHolidayRepository.findApplicable(
                new UUID(0L, 1L),
                LocalDate.of(2026, 6, 1),
                LocalDate.of(2026, 6, 30),
                new UUID(0L, 10L)
        )).thenReturn(List.of(holiday));

        List<Holiday> holidays = service.listDomainHolidaysForMonth("admin@escala.local", 2026, 6, new UUID(0L, 10L));

        assertEquals(1, holidays.size());
        assertEquals(LocalDate.of(2026, 6, 4), holidays.getFirst().date());
        assertEquals("Corpus Christi", holidays.getFirst().name());
        assertEquals(HolidayType.MUNICIPAL, holidays.getFirst().type());
    }

    private User requester() {
        return User.builder()
                .email("admin@escala.local")
                .company(Company.builder().id(new UUID(0L, 1L)).name("Escala Demo").slug("escala-demo").build())
                .build();
    }
}
