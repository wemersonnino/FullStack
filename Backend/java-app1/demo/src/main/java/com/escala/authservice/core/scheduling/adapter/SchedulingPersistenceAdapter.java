package com.escala.authservice.core.scheduling.adapter;

import com.escala.authservice.core.scheduling.domain.WorkShiftDomain;
import com.escala.authservice.core.scheduling.port.out.WorkShiftOutputPort;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.WorkShift;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.WorkShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SchedulingPersistenceAdapter implements WorkShiftOutputPort {
    private final WorkShiftRepository workShiftRepository;
    private final EmployeeRepository employeeRepository;

    @Override
    public void saveAll(List<WorkShiftDomain> shifts) {
        List<Long> employeeIds = shifts.stream()
                .map(WorkShiftDomain::getEmployeeId)
                .distinct()
                .toList();

        java.util.Map<Long, Employee> employeeMap = employeeRepository.findAllById(employeeIds).stream()
                .collect(java.util.stream.Collectors.toMap(Employee::getId, e -> e));

        List<WorkShift> entities = shifts.stream()
                .map(domain -> {
                    Employee employee = employeeMap.get(domain.getEmployeeId());
                    if (employee == null) {
                        throw new java.util.NoSuchElementException("Employee com ID " + domain.getEmployeeId() + " nao encontrado");
                    }
                    return toEntityWithEmployee(domain, employee);
                })
                .toList();
        workShiftRepository.saveAll(entities);
    }

    private WorkShift toEntityWithEmployee(WorkShiftDomain domain, Employee employee) {
        return WorkShift.builder()
                .id(domain.getId())
                .employee(employee)
                .shiftDate(domain.getShiftDate())
                .startTime(domain.getStartTime())
                .endTime(domain.getEndTime())
                .status(domain.getStatus())
                .workMode(domain.getWorkMode())
                .padraoEscala(domain.getPadraoEscala())
                .notes(domain.getNotes())
                .build();
    }

    @Override
    public List<WorkShiftDomain> findByCompanyAndPeriod(Long companyId, LocalDate start, LocalDate end) {
        return workShiftRepository.findByEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(companyId, start, end)
                .stream()
                .map(this::toDomain)
                .toList();
    }

    @Override
    public boolean existsByEmployeeAndDate(Long employeeId, LocalDate date) {
        return workShiftRepository.existsByEmployeeIdAndShiftDate(employeeId, date);
    }

    private WorkShift toEntity(WorkShiftDomain domain) {
        Employee employee = employeeRepository.findById(domain.getEmployeeId()).orElseThrow();
        return WorkShift.builder()
                .id(domain.getId())
                .employee(employee)
                .shiftDate(domain.getShiftDate())
                .startTime(domain.getStartTime())
                .endTime(domain.getEndTime())
                .status(domain.getStatus())
                .workMode(domain.getWorkMode())
                .padraoEscala(domain.getPadraoEscala())
                .notes(domain.getNotes())
                .build();
    }

    private WorkShiftDomain toDomain(WorkShift entity) {
        return WorkShiftDomain.builder()
                .id(entity.getId())
                .employeeId(entity.getEmployee().getId())
                .companyId(entity.getEmployee().getCompany().getId())
                .shiftDate(entity.getShiftDate())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .status(entity.getStatus())
                .workMode(entity.getWorkMode())
                .padraoEscala(entity.getPadraoEscala())
                .notes(entity.getNotes())
                .build();
    }
}
