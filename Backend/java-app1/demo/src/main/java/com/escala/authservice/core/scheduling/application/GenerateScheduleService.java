package com.escala.authservice.core.scheduling.application;

import com.escala.authservice.core.common.port.out.EmployeeOutputPort;
import com.escala.authservice.core.scheduling.domain.WorkShiftDomain;
import com.escala.authservice.core.scheduling.port.out.WorkShiftOutputPort;
import com.escala.authservice.dto.GenerateScheduleRequest;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.ShiftStatus;
import com.escala.authservice.entity.WorkMode;
import com.escala.authservice.scheduling.domain.enums.PadraoEscala;
import com.escala.authservice.scheduling.domain.policy.JornadaPlanejada;
import com.escala.authservice.scheduling.domain.policy.LaborRuleEngine;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
public class GenerateScheduleService {
    private final WorkShiftOutputPort workShiftOutputPort;
    private final EmployeeOutputPort employeeOutputPort;
    private final LaborRuleEngine laborRuleEngine = new LaborRuleEngine();

    public List<WorkShiftDomain> generate(GenerateScheduleRequest request, UUID companyId) {
        YearMonth yearMonth = YearMonth.of(request.getYear(), request.getMonth());
        List<Employee> employees = resolveEmployees(request, companyId);
        
        if (employees.isEmpty()) {
            throw new IllegalStateException("Não há funcionários ativos para gerar escala");
        }

        List<UUID> employeeIds = employees.stream().map(Employee::getId).toList();
        
        // Pre-load logic (Moved from Service to here)
        List<WorkShiftDomain> preloaded = workShiftOutputPort.findByCompanyAndPeriod(
                companyId, 
                yearMonth.atDay(1).minusDays(7), 
                yearMonth.atEndOfMonth().plusDays(7)
        );

        Map<UUID, List<WorkShiftDomain>> preloadedMap = preloaded.stream()
                .collect(Collectors.groupingBy(WorkShiftDomain::getEmployeeId));

        Map<UUID, Integer> allocationCount = employees.stream()
                .collect(Collectors.toMap(Employee::getId, employee -> 0));
        
        Set<String> existingEmployeeDates = preloaded.stream()
                .filter(ws -> ws.getShiftDate().getMonthValue() == request.getMonth() && ws.getShiftDate().getYear() == request.getYear())
                .map(ws -> ws.getEmployeeId() + ":" + ws.getShiftDate())
                .collect(Collectors.toSet());

        UUID previousEmployeeId = null;
        List<WorkShiftDomain> generated = new ArrayList<>();

        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            LocalDate date = yearMonth.atDay(day);
            Employee selected = selectEmployee(employees, allocationCount, previousEmployeeId);

            String key = selected.getId() + ":" + date;
            if (!existingEmployeeDates.contains(key)) {
                // Validate Labor Rules (Domain Policy)
                validateLaborRules(selected, date, request, generated, preloadedMap);
                
                WorkShiftDomain shift = WorkShiftDomain.builder()
                        .employeeId(selected.getId())
                        .companyId(companyId)
                        .shiftDate(date)
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .status(ShiftStatus.SCHEDULED)
                        .workMode(request.getWorkMode())
                        .padraoEscala(PadraoEscala.COMUM)
                        .notes("Gerada automaticamente via Core Hexagonal")
                        .build();
                
                generated.add(shift);
                existingEmployeeDates.add(key);
            }

            allocationCount.computeIfPresent(selected.getId(), (id, count) -> count + 1);
            previousEmployeeId = selected.getId();
        }

        workShiftOutputPort.saveAll(generated);
        return generated;
    }

    private List<Employee> resolveEmployees(GenerateScheduleRequest request, UUID companyId) {
        if (request.getEmployeeIds() == null || request.getEmployeeIds().isEmpty()) {
            return employeeOutputPort.findActiveByCompany(companyId);
        }
        return employeeOutputPort.findByIdsAndActive(request.getEmployeeIds(), companyId);
    }

    private Employee selectEmployee(List<Employee> employees, Map<UUID, Integer> allocationCount, UUID previousEmployeeId) {
        return employees.stream()
                .filter(e -> employees.size() == 1 || !Objects.equals(e.getId(), previousEmployeeId))
                .min(Comparator.comparing((Employee e) -> allocationCount.getOrDefault(e.getId(), 0))
                        .thenComparing(Employee::getFullName))
                .orElse(employees.get(0));
    }

    private void validateLaborRules(Employee employee, LocalDate date, GenerateScheduleRequest request, 
                                    List<WorkShiftDomain> inMemory, Map<UUID, List<WorkShiftDomain>> preloaded) {
        JornadaPlanejada jornada = new JornadaPlanejada(employee.getId(), date, request.getStartTime(), request.getEndTime(), PadraoEscala.COMUM);
        
        List<JornadaPlanejada> relacionadas = new ArrayList<>();
        
        // From DB
        preloaded.getOrDefault(employee.getId(), List.of()).stream()
                .filter(ws -> !ws.getShiftDate().isBefore(date.minusDays(7)) && !ws.getShiftDate().isAfter(date.plusDays(7)))
                .map(this::toJornada)
                .forEach(relacionadas::add);
        
        // From Memory
        inMemory.stream()
                .filter(ws -> Objects.equals(ws.getEmployeeId(), employee.getId()))
                .map(this::toJornada)
                .forEach(relacionadas::add);

        laborRuleEngine.validar(jornada, relacionadas).exigirAprovacao();
    }

    private JornadaPlanejada toJornada(WorkShiftDomain ws) {
        return new JornadaPlanejada(ws.getEmployeeId(), ws.getShiftDate(), ws.getStartTime(), ws.getEndTime(), ws.getPadraoEscala());
    }
}
