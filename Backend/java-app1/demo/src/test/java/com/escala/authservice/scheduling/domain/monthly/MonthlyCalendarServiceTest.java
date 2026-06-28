package com.escala.authservice.scheduling.domain.monthly;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.UUID;
import java.time.ZoneId;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MonthlyCalendarServiceTest {
    private final MonthlyCalendarService service = new MonthlyCalendarService();

    @Test
    void geraCalendarioComQuantidadeDeDiasDeCadaMes() {
        assertEquals(28, service.generate(2026, 2, ZoneId.of("America/Sao_Paulo"), null, List.of()).days().size());
        assertEquals(29, service.generate(2028, 2, ZoneId.of("America/Sao_Paulo"), null, List.of()).days().size());
        assertEquals(30, service.generate(2026, 4, ZoneId.of("America/Sao_Paulo"), null, List.of()).days().size());
        assertEquals(31, service.generate(2026, 7, ZoneId.of("America/Sao_Paulo"), null, List.of()).days().size());
    }

    @Test
    void marcaFinaisDeSemana() {
        MonthlyCalendar calendar = service.generate(2026, 6, ZoneId.of("America/Sao_Paulo"), null, List.of());

        assertFalse(calendar.days().getFirst().weekend());
        assertTrue(calendar.days().get(5).weekend());
        assertTrue(calendar.days().get(6).weekend());
    }

    @Test
    void aplicaFeriadoGlobalEEspecificoDaUnidade() {
        Holiday nacional = new Holiday(LocalDate.of(2026, 6, 4), "Corpus Christi", HolidayType.NATIONAL, null);
        Holiday unidade = new Holiday(LocalDate.of(2026, 6, 15), "Aniversario da unidade", HolidayType.CUSTOM, new UUID(0L, 10L));
        Holiday outraUnidade = new Holiday(LocalDate.of(2026, 6, 16), "Outra unidade", HolidayType.CUSTOM, new UUID(0L, 20L));

        MonthlyCalendar calendar = service.generate(
                2026,
                6,
                ZoneId.of("America/Sao_Paulo"),
                new UUID(0L, 10L),
                List.of(nacional, unidade, outraUnidade)
        );

        assertTrue(day(calendar, 4).holidayApplied());
        assertTrue(day(calendar, 15).holidayApplied());
        assertFalse(day(calendar, 16).holidayApplied());
    }

    private MonthlyCalendarDay day(MonthlyCalendar calendar, int dayOfMonth) {
        return calendar.days().stream()
                .filter(day -> day.date().getDayOfMonth() == dayOfMonth)
                .findFirst()
                .orElseThrow();
    }
}
