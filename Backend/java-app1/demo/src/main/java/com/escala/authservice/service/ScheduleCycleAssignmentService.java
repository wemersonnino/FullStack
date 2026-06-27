package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.CycleAssignmentItemRequest;
import com.escala.authservice.dto.scheduling.CycleAssignmentsRequest;
import com.escala.authservice.dto.scheduling.CycleCounterResponse;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleAssignment;
import com.escala.authservice.entity.ScheduleCycleStatus;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.ScheduleCycleAssignmentRepository;
import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;
import com.escala.authservice.scheduling.domain.monthly.LegendCatalogService;
import com.escala.authservice.scheduling.domain.monthly.LegendCode;
import com.escala.authservice.scheduling.domain.monthly.MonthlyCounterCalculator;
import com.escala.authservice.scheduling.domain.monthly.ScheduleCounterSnapshot;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScheduleCycleAssignmentService {
    private final ScheduleCycleService scheduleCycleService;
    private final ScheduleCycleAssignmentRepository assignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final LegendCatalogService legendCatalogService;
    private final MonthlyCounterCalculator monthlyCounterCalculator;

    @Transactional
    public List<ScheduleCycleAssignment> replaceAssignments(
            String email,
            UUID cyclePublicId,
            CycleAssignmentsRequest request
    ) {
        ScheduleCycle cycle = scheduleCycleService.getCycle(email, cyclePublicId);
        ensureEditable(cycle);
        List<CycleAssignmentItemRequest> items = request == null || request.assignments() == null
                ? List.of()
                : request.assignments();
        YearMonth cycleMonth = YearMonth.of(cycle.getYear(), cycle.getMonth());
        Set<String> employeeDateKeys = new HashSet<>();

        List<ScheduleCycleAssignment> assignments = items.stream()
                .map(item -> toEntity(cycle, cycleMonth, employeeDateKeys, item))
                .toList();

        assignmentRepository.deleteByCycleId(cycle.getId());
        return assignmentRepository.saveAll(assignments);
    }

    public List<ScheduleCycleAssignment> listAssignments(String email, UUID cyclePublicId) {
        ScheduleCycle cycle = scheduleCycleService.getCycle(email, cyclePublicId);
        return assignmentRepository.findByCycleIdOrderByAssignmentDateAscEmployeeFullNameAsc(cycle.getId());
    }

    public List<CycleCounterResponse> calculateCounters(String email, UUID cyclePublicId) {
        List<ScheduleCycleAssignment> assignments = listAssignments(email, cyclePublicId);
        Map<Long, String> employeeNames = new HashMap<>();
        assignments.forEach(assignment -> employeeNames.put(
                assignment.getEmployee().getId(),
                assignment.getEmployee().getFullName()
        ));

        List<com.escala.authservice.scheduling.domain.monthly.ScheduleAssignment> domainAssignments =
                assignments.stream()
                        .map(this::toDomain)
                        .toList();

        return monthlyCounterCalculator.calculate(domainAssignments).stream()
                .map(counter -> toResponse(counter, employeeNames))
                .toList();
    }

    private ScheduleCycleAssignment toEntity(
            ScheduleCycle cycle,
            YearMonth cycleMonth,
            Set<String> employeeDateKeys,
            CycleAssignmentItemRequest item
    ) {
        validateItem(item, cycleMonth, employeeDateKeys);
        Employee employee = employeeRepository.findById(item.employeeId())
                .orElseThrow(() -> new IllegalArgumentException("Funcionario da atribuicao nao encontrado"));
        if (!Objects.equals(employee.getCompany().getId(), cycle.getCompany().getId()) || !employee.isActive()) {
            throw new IllegalArgumentException("Funcionario da atribuicao nao pertence a empresa do ciclo ou esta inativo");
        }

        LegendCode legend = legendCatalogService.findByCode(item.legendCode())
                .orElseThrow(() -> new IllegalArgumentException("Legenda de escala invalida"));

        return ScheduleCycleAssignment.builder()
                .cycle(cycle)
                .employee(employee)
                .assignmentDate(item.date())
                .legendCode(legend.code())
                .legendLabel(legend.label())
                .legendImpact(legend.impact().name())
                .plannedMinutes(legend.plannedHours().toMinutes())
                .modality(item.modality() == null ? ModalidadeTrabalho.PRESENCIAL : item.modality())
                .build();
    }

    private void validateItem(
            CycleAssignmentItemRequest item,
            YearMonth cycleMonth,
            Set<String> employeeDateKeys
    ) {
        if (item == null) {
            throw new IllegalArgumentException("Atribuicao de escala e obrigatoria");
        }
        if (item.employeeId() == null) {
            throw new IllegalArgumentException("Funcionario da atribuicao e obrigatorio");
        }
        if (item.date() == null) {
            throw new IllegalArgumentException("Data da atribuicao e obrigatoria");
        }
        if (!YearMonth.from(item.date()).equals(cycleMonth)) {
            throw new IllegalArgumentException("Data da atribuicao deve pertencer ao mes do ciclo");
        }
        String key = item.employeeId() + "|" + item.date();
        if (!employeeDateKeys.add(key)) {
            throw new IllegalArgumentException("Funcionario possui mais de uma atribuicao no mesmo dia dentro do ciclo");
        }
    }

    private void ensureEditable(ScheduleCycle cycle) {
        if (cycle.getStatus() != ScheduleCycleStatus.RASCUNHO && cycle.getStatus() != ScheduleCycleStatus.EM_VALIDACAO) {
            throw new IllegalStateException("Somente ciclos em rascunho ou validacao podem receber atribuicoes");
        }
    }

    private com.escala.authservice.scheduling.domain.monthly.ScheduleAssignment toDomain(
            ScheduleCycleAssignment assignment
    ) {
        LegendCode legend = new LegendCode(
                assignment.getLegendCode(),
                assignment.getLegendLabel(),
                com.escala.authservice.scheduling.domain.monthly.LegendImpact.valueOf(assignment.getLegendImpact()),
                java.time.Duration.ofMinutes(assignment.getPlannedMinutes())
        );
        return new com.escala.authservice.scheduling.domain.monthly.ScheduleAssignment(
                assignment.getEmployee().getId(),
                assignment.getAssignmentDate(),
                legend,
                assignment.getModality()
        );
    }

    private CycleCounterResponse toResponse(ScheduleCounterSnapshot counter, Map<Long, String> employeeNames) {
        return new CycleCounterResponse(
                counter.employeeId(),
                employeeNames.get(counter.employeeId()),
                counter.workedDays(),
                counter.restDays(),
                counter.absenceDays(),
                counter.neutralDays(),
                counter.plannedHours().toMinutes()
        );
    }
}
