package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.CycleValidationAlertResponse;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleAssignment;
import com.escala.authservice.entity.ScheduleHoliday;
import com.escala.authservice.repository.ScheduleCycleAssignmentRepository;
import com.escala.authservice.repository.ScheduleHolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleCycleValidationService {
    private final ScheduleCycleService scheduleCycleService;
    private final ScheduleCycleAssignmentRepository assignmentRepository;
    private final ScheduleHolidayRepository holidayRepository;

    public List<CycleValidationAlertResponse> validateCycle(String email, UUID cyclePublicId) {
        ScheduleCycle cycle = scheduleCycleService.getCycle(email, cyclePublicId);
        List<ScheduleCycleAssignment> assignments =
                assignmentRepository.findByCycleIdOrderByAssignmentDateAscEmployeeFullNameAsc(cycle.getId());

        List<CycleValidationAlertResponse> alerts = new ArrayList<>();
        if (assignments.isEmpty()) {
            alerts.add(alert("CRITICAL", "EMPTY_CYCLE", "Ciclo mensal nao possui atribuicoes", null, null, null));
            return alerts;
        }

        List<ScheduleHoliday> holidays = holidayRepository.findApplicable(
                cycle.getCompany().getId(),
                LocalDate.of(cycle.getYear(), cycle.getMonth(), 1),
                LocalDate.of(cycle.getYear(), cycle.getMonth(), 1).withDayOfMonth(
                        LocalDate.of(cycle.getYear(), cycle.getMonth(), 1).lengthOfMonth()
                ),
                cycle.getUnitId()
        );

        Map<LocalDate, ScheduleHoliday> holidaysByDate = holidays.stream()
                .collect(Collectors.toMap(ScheduleHoliday::getHolidayDate, holiday -> holiday, (first, second) -> first));

        alerts.addAll(validateConsecutiveWorkedDays(assignments));
        alerts.addAll(validateWeekendAndHolidayWork(assignments, holidaysByDate));

        return alerts.stream()
                .sorted(Comparator
                        .comparing(CycleValidationAlertResponse::severity)
                        .thenComparing(alert -> alert.date() == null ? LocalDate.MIN : alert.date())
                        .thenComparing(alert -> alert.employeeName() == null ? "" : alert.employeeName()))
                .toList();
    }

    private List<CycleValidationAlertResponse> validateConsecutiveWorkedDays(List<ScheduleCycleAssignment> assignments) {
        Map<Long, List<ScheduleCycleAssignment>> byEmployee = assignments.stream()
                .collect(Collectors.groupingBy(assignment -> assignment.getEmployee().getId()));

        List<CycleValidationAlertResponse> alerts = new ArrayList<>();
        byEmployee.values().forEach(employeeAssignments -> {
            List<ScheduleCycleAssignment> ordered = employeeAssignments.stream()
                    .sorted(Comparator.comparing(ScheduleCycleAssignment::getAssignmentDate))
                    .toList();
            int consecutiveWorkedDays = 0;
            for (ScheduleCycleAssignment assignment : ordered) {
                if ("WORKED".equals(assignment.getLegendImpact())) {
                    consecutiveWorkedDays++;
                } else {
                    consecutiveWorkedDays = 0;
                }
                if (consecutiveWorkedDays > 6) {
                    alerts.add(alert(
                            "CRITICAL",
                            "MAX_CONSECUTIVE_WORK_DAYS",
                            "Funcionario possui mais de seis dias trabalhados consecutivos",
                            assignment.getEmployee().getId(),
                            assignment.getEmployee().getFullName(),
                            assignment.getAssignmentDate()
                    ));
                    consecutiveWorkedDays = 0;
                }
            }
        });
        return alerts;
    }

    private List<CycleValidationAlertResponse> validateWeekendAndHolidayWork(
            List<ScheduleCycleAssignment> assignments,
            Map<LocalDate, ScheduleHoliday> holidaysByDate
    ) {
        return assignments.stream()
                .filter(assignment -> "WORKED".equals(assignment.getLegendImpact()))
                .filter(assignment -> isWeekend(assignment.getAssignmentDate()) || holidaysByDate.containsKey(assignment.getAssignmentDate()))
                .map(assignment -> {
                    boolean holiday = holidaysByDate.containsKey(assignment.getAssignmentDate());
                    String rule = holiday ? "HOLIDAY_WORK" : "WEEKEND_WORK";
                    String message = holiday
                            ? "Funcionario possui trabalho planejado em feriado"
                            : "Funcionario possui trabalho planejado em fim de semana";
                    return alert(
                            "WARNING",
                            rule,
                            message,
                            assignment.getEmployee().getId(),
                            assignment.getEmployee().getFullName(),
                            assignment.getAssignmentDate()
                    );
                })
                .toList();
    }

    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    private CycleValidationAlertResponse alert(
            String severity,
            String ruleCode,
            String message,
            Long employeeId,
            String employeeName,
            LocalDate date
    ) {
        String rawId = severity + "|" + ruleCode + "|" + employeeId + "|" + date + "|" + message;
        return new CycleValidationAlertResponse(
                UUID.nameUUIDFromBytes(rawId.getBytes(StandardCharsets.UTF_8)).toString(),
                severity,
                ruleCode,
                message,
                employeeId,
                employeeName,
                date
        );
    }
}
