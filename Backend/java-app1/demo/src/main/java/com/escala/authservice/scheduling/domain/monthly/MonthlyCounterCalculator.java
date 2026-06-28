package com.escala.authservice.scheduling.domain.monthly;

import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MonthlyCounterCalculator {

    public List<ScheduleCounterSnapshot> calculate(List<ScheduleAssignment> assignments) {
        List<ScheduleAssignment> safeAssignments = assignments == null ? List.of() : assignments;
        Map<UUID, List<ScheduleAssignment>> byEmployee = safeAssignments.stream()
                .collect(Collectors.groupingBy(ScheduleAssignment::employeeId));

        return byEmployee.entrySet().stream()
                .map(entry -> calculateForEmployee(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(ScheduleCounterSnapshot::employeeId))
                .toList();
    }

    private ScheduleCounterSnapshot calculateForEmployee(UUID employeeId, List<ScheduleAssignment> assignments) {
        int workedDays = count(assignments, LegendImpact.WORKED);
        int restDays = count(assignments, LegendImpact.REST);
        int absenceDays = count(assignments, LegendImpact.ABSENCE);
        int neutralDays = count(assignments, LegendImpact.NEUTRAL);
        Duration plannedHours = assignments.stream()
                .filter(assignment -> assignment.legend().impact() == LegendImpact.WORKED)
                .map(assignment -> assignment.legend().plannedHours())
                .reduce(Duration.ZERO, Duration::plus);

        return new ScheduleCounterSnapshot(employeeId, workedDays, restDays, absenceDays, neutralDays, plannedHours);
    }

    private int count(List<ScheduleAssignment> assignments, LegendImpact impact) {
        return (int) assignments.stream()
                .filter(assignment -> assignment.legend().impact() == impact)
                .count();
    }
}
