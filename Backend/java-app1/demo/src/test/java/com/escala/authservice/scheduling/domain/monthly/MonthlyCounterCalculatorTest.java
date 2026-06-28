package com.escala.authservice.scheduling.domain.monthly;

import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;
import org.junit.jupiter.api.Test;

import java.time.Duration;
import java.util.UUID;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MonthlyCounterCalculatorTest {
    private final MonthlyCounterCalculator calculator = new MonthlyCounterCalculator();
    private final LegendCode trabalho = new LegendCode("T", "Trabalho", LegendImpact.WORKED, Duration.ofHours(8));
    private final LegendCode folga = new LegendCode("F", "Folga", LegendImpact.REST, Duration.ZERO);
    private final LegendCode atestado = new LegendCode("AT", "Atestado", LegendImpact.ABSENCE, Duration.ZERO);
    private final LegendCode treinamento = new LegendCode("TR", "Treinamento", LegendImpact.NEUTRAL, Duration.ZERO);

    @Test
    void calculaContadoresPorColaborador() {
        List<ScheduleAssignment> assignments = List.of(
                assignment(new UUID(0L, 1L), 1, trabalho),
                assignment(new UUID(0L, 1L), 2, trabalho),
                assignment(new UUID(0L, 1L), 3, folga),
                assignment(new UUID(0L, 1L), 4, atestado),
                assignment(new UUID(0L, 1L), 5, treinamento),
                assignment(new UUID(0L, 2L), 1, trabalho)
        );

        List<ScheduleCounterSnapshot> counters = calculator.calculate(assignments);

        ScheduleCounterSnapshot first = counters.getFirst();
        assertEquals(new UUID(0L, 1L), first.employeeId());
        assertEquals(2, first.workedDays());
        assertEquals(1, first.restDays());
        assertEquals(1, first.absenceDays());
        assertEquals(1, first.neutralDays());
        assertEquals(Duration.ofHours(16), first.plannedHours());
        assertEquals(new UUID(0L, 2L), counters.get(1).employeeId());
        assertEquals(Duration.ofHours(8), counters.get(1).plannedHours());
    }

    private ScheduleAssignment assignment(UUID employeeId, int day, LegendCode legend) {
        return new ScheduleAssignment(employeeId, LocalDate.of(2026, 6, day), legend, ModalidadeTrabalho.PRESENCIAL);
    }
}
