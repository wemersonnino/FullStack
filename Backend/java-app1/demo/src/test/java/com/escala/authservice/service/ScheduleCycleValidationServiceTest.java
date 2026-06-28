package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.CycleValidationAlertResponse;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleAssignment;
import com.escala.authservice.entity.ScheduleHoliday;
import com.escala.authservice.repository.ScheduleCycleAssignmentRepository;
import com.escala.authservice.repository.ScheduleHolidayRepository;
import com.escala.authservice.repository.ScheduleValidationAcknowledgementRepository;
import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;
import com.escala.authservice.scheduling.domain.monthly.HolidayType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleCycleValidationServiceTest {
    @Mock
    private ScheduleCycleService scheduleCycleService;

    @Mock
    private ScheduleCycleAssignmentRepository assignmentRepository;

    @Mock
    private ScheduleHolidayRepository holidayRepository;

    @Mock
    private ScheduleValidationAcknowledgementRepository acknowledgementRepository;

    private ScheduleCycleValidationService service;

    @BeforeEach
    void setUp() {
        service = new ScheduleCycleValidationService(
                scheduleCycleService,
                assignmentRepository,
                holidayRepository,
                acknowledgementRepository
        );
    }

    @Test
    void geraAlertaCriticoParaCicloSemAtribuicoes() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId);
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(assignmentRepository.findByCycleIdOrderByAssignmentDateAscEmployeeFullNameAsc(new UUID(0L, 5L))).thenReturn(List.of());

        List<CycleValidationAlertResponse> alerts = service.validateCycle("admin@escala.local", cyclePublicId);

        assertEquals(1, alerts.size());
        assertEquals("CRITICAL", alerts.getFirst().severity());
        assertEquals("EMPTY_CYCLE", alerts.getFirst().ruleCode());
    }

    @Test
    void geraAlertaCriticoParaMaisDeSeisDiasTrabalhadosConsecutivos() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId);
        Employee employee = employee();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(assignmentRepository.findByCycleIdOrderByAssignmentDateAscEmployeeFullNameAsc(new UUID(0L, 5L))).thenReturn(List.of(
                worked(cycle, employee, 1),
                worked(cycle, employee, 2),
                worked(cycle, employee, 3),
                worked(cycle, employee, 4),
                worked(cycle, employee, 5),
                worked(cycle, employee, 6),
                worked(cycle, employee, 7)
        ));
        when(holidayRepository.findApplicable(new UUID(0L, 1L), LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30), new UUID(0L, 10L)))
                .thenReturn(List.of());

        List<CycleValidationAlertResponse> alerts = service.validateCycle("admin@escala.local", cyclePublicId);

        assertTrue(alerts.stream().anyMatch(alert -> "MAX_CONSECUTIVE_WORK_DAYS".equals(alert.ruleCode())));
    }

    @Test
    void geraAvisosParaTrabalhoEmFimDeSemanaEFeriado() {
        UUID cyclePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId);
        Employee employee = employee();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(assignmentRepository.findByCycleIdOrderByAssignmentDateAscEmployeeFullNameAsc(new UUID(0L, 5L))).thenReturn(List.of(
                worked(cycle, employee, 6),
                worked(cycle, employee, 15)
        ));
        when(holidayRepository.findApplicable(new UUID(0L, 1L), LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 30), new UUID(0L, 10L)))
                .thenReturn(List.of(ScheduleHoliday.builder()
                        .holidayDate(LocalDate.of(2026, 6, 15))
                        .name("Feriado customizado")
                        .type(HolidayType.CUSTOM)
                        .unitId(new UUID(0L, 10L))
                        .build()));

        List<CycleValidationAlertResponse> alerts = service.validateCycle("admin@escala.local", cyclePublicId);

        assertTrue(alerts.stream().anyMatch(alert -> "WEEKEND_WORK".equals(alert.ruleCode())));
        assertTrue(alerts.stream().anyMatch(alert -> "HOLIDAY_WORK".equals(alert.ruleCode())));
    }

    private ScheduleCycle cycle(UUID publicId) {
        return ScheduleCycle.builder()
                .id(new UUID(0L, 5L))
                .publicId(publicId)
                .company(Company.builder().id(new UUID(0L, 1L)).name("Escala Demo").slug("escala-demo").build())
                .unitId(new UUID(0L, 10L))
                .year(2026)
                .month(6)
                .timezone("America/Sao_Paulo")
                .build();
    }

    private Employee employee() {
        return Employee.builder()
                .id(new UUID(0L, 20L))
                .fullName("Ana")
                .email("ana@escala.local")
                .company(Company.builder().id(new UUID(0L, 1L)).name("Escala Demo").slug("escala-demo").build())
                .build();
    }

    private ScheduleCycleAssignment worked(ScheduleCycle cycle, Employee employee, int day) {
        return ScheduleCycleAssignment.builder()
                .cycle(cycle)
                .employee(employee)
                .assignmentDate(LocalDate.of(2026, 6, day))
                .legendCode("T")
                .legendLabel("Trabalho")
                .legendImpact("WORKED")
                .plannedMinutes(480)
                .modality(ModalidadeTrabalho.PRESENCIAL)
                .build();
    }
}
