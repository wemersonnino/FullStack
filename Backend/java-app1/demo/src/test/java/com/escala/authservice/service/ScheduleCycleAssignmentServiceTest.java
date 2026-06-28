package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.CycleAssignmentItemRequest;
import com.escala.authservice.dto.scheduling.CycleAssignmentsRequest;
import com.escala.authservice.dto.scheduling.CycleCounterResponse;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleAssignment;
import com.escala.authservice.entity.ScheduleCycleStatus;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.ScheduleCycleAssignmentRepository;
import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;
import com.escala.authservice.scheduling.domain.monthly.LegendCatalogService;
import com.escala.authservice.scheduling.domain.monthly.MonthlyCounterCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
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
class ScheduleCycleAssignmentServiceTest {
    @Mock
    private ScheduleCycleService scheduleCycleService;

    @Mock
    private ScheduleCycleAssignmentRepository assignmentRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    private final LegendCatalogService legendCatalogService = new LegendCatalogService();
    private final MonthlyCounterCalculator monthlyCounterCalculator = new MonthlyCounterCalculator();

    private ScheduleCycleAssignmentService service;

    @BeforeEach
    void setUp() {
        service = new ScheduleCycleAssignmentService(
                scheduleCycleService,
                assignmentRepository,
                employeeRepository,
                legendCatalogService,
                monthlyCounterCalculator
        );
    }

    @Test
    void substituiAtribuicoesDoCicloEmRascunho() {
        UUID cyclePublicId = UUID.randomUUID();
        UUID employeePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.RASCUNHO);
        Employee employee = employee(new UUID(0L, 10L), employeePublicId, "Ana");
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(employeeRepository.findByPublicIdAndCompanyId(employeePublicId, new UUID(0L, 1L))).thenReturn(Optional.of(employee));
        when(assignmentRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<ScheduleCycleAssignment> assignments = service.replaceAssignments(
                "admin@escala.local",
                cyclePublicId,
                new CycleAssignmentsRequest(List.of(
                        new CycleAssignmentItemRequest(employeePublicId, LocalDate.of(2026, 6, 1), "T", ModalidadeTrabalho.REMOTO)
                ))
        );

        ArgumentCaptor<UUID> cycleIdCaptor = ArgumentCaptor.forClass(UUID.class);
        verify(assignmentRepository).deleteByCycleId(cycleIdCaptor.capture());
        assertEquals(new UUID(0L, 5L), cycleIdCaptor.getValue());
        assertEquals(1, assignments.size());
        assertEquals("T", assignments.getFirst().getLegendCode());
        assertEquals("Trabalho", assignments.getFirst().getLegendLabel());
        assertEquals(480, assignments.getFirst().getPlannedMinutes());
        assertEquals(ModalidadeTrabalho.REMOTO, assignments.getFirst().getModality());
    }

    @Test
    void permiteSubstituirAtribuicoesDeCicloEmRetificacao() {
        UUID cyclePublicId = UUID.randomUUID();
        UUID employeePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.RETIFICADO);
        Employee employee = employee(new UUID(0L, 10L), employeePublicId, "Ana");
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(employeeRepository.findByPublicIdAndCompanyId(employeePublicId, new UUID(0L, 1L))).thenReturn(Optional.of(employee));
        when(assignmentRepository.saveAll(any())).thenAnswer(invocation -> invocation.getArgument(0));

        List<ScheduleCycleAssignment> assignments = service.replaceAssignments(
                "admin@escala.local",
                cyclePublicId,
                new CycleAssignmentsRequest(List.of(
                        new CycleAssignmentItemRequest(employeePublicId, LocalDate.of(2026, 6, 1), "T", null)
                ))
        );

        assertEquals(1, assignments.size());
        verify(assignmentRepository).deleteByCycleId(new UUID(0L, 5L));
    }

    @Test
    void bloqueiaSubstituicaoDeAtribuicoesDeCicloPublicado() {
        UUID cyclePublicId = UUID.randomUUID();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId))
                .thenReturn(cycle(cyclePublicId, ScheduleCycleStatus.PUBLICADO));

        CycleAssignmentsRequest request = new CycleAssignmentsRequest(List.of());

        assertThrows(IllegalStateException.class, () -> service.replaceAssignments(
                "admin@escala.local",
                cyclePublicId,
                request
        ));
    }

    @Test
    void rejeitaAtribuicaoDuplicadaParaMesmoFuncionarioEDia() {
        UUID cyclePublicId = UUID.randomUUID();
        UUID employeePublicId = UUID.randomUUID();
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId))
                .thenReturn(cycle(cyclePublicId, ScheduleCycleStatus.RASCUNHO));

        CycleAssignmentsRequest request = new CycleAssignmentsRequest(List.of(
                new CycleAssignmentItemRequest(employeePublicId, LocalDate.of(2026, 6, 1), "T", null),
                new CycleAssignmentItemRequest(employeePublicId, LocalDate.of(2026, 6, 1), "F", null)
        ));

        assertThrows(IllegalArgumentException.class, () -> service.replaceAssignments(
                "admin@escala.local",
                cyclePublicId,
                request
        ));
    }

    @Test
    void calculaContadoresDoCiclo() {
        UUID cyclePublicId = UUID.randomUUID();
        UUID employeePublicId = UUID.randomUUID();
        ScheduleCycle cycle = cycle(cyclePublicId, ScheduleCycleStatus.RASCUNHO);
        Employee employee = employee(new UUID(0L, 10L), employeePublicId, "Ana");
        when(scheduleCycleService.getCycle("admin@escala.local", cyclePublicId)).thenReturn(cycle);
        when(assignmentRepository.findByCycleIdOrderByAssignmentDateAscEmployeeFullNameAsc(new UUID(0L, 5L))).thenReturn(List.of(
                assignment(cycle, employee, LocalDate.of(2026, 6, 1), "T", "Trabalho", "WORKED", 480),
                assignment(cycle, employee, LocalDate.of(2026, 6, 2), "F", "Folga", "REST", 0),
                assignment(cycle, employee, LocalDate.of(2026, 6, 3), "AT", "Atestado", "ABSENCE", 0)
        ));

        List<CycleCounterResponse> counters = service.calculateCounters("admin@escala.local", cyclePublicId);

        assertEquals(1, counters.size());
        CycleCounterResponse counter = counters.getFirst();
        assertEquals(employeePublicId.toString(), counter.employeeId());
        assertEquals("Ana", counter.employeeName());
        assertEquals(1, counter.workedDays());
        assertEquals(1, counter.restDays());
        assertEquals(1, counter.absenceDays());
        assertEquals(480, counter.plannedMinutes());
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

    private Employee employee(UUID id, UUID publicId, String name) {
        return Employee.builder()
                .id(id)
                .publicId(publicId)
                .fullName(name)
                .email(name.toLowerCase() + "@escala.local")
                .active(true)
                .company(Company.builder().id(new UUID(0L, 1L)).name("Escala Demo").slug("escala-demo").build())
                .build();
    }

    private ScheduleCycleAssignment assignment(
            ScheduleCycle cycle,
            Employee employee,
            LocalDate date,
            String code,
            String label,
            String impact,
            long minutes
    ) {
        return ScheduleCycleAssignment.builder()
                .cycle(cycle)
                .employee(employee)
                .assignmentDate(date)
                .legendCode(code)
                .legendLabel(label)
                .legendImpact(impact)
                .plannedMinutes(minutes)
                .modality(ModalidadeTrabalho.PRESENCIAL)
                .build();
    }
}
