package com.escala.authservice.service;

import com.escala.authservice.dto.CreateShiftSwapRequest;
import com.escala.authservice.dto.DashboardSummaryResponse;
import com.escala.authservice.dto.DecideShiftSwapRequest;
import com.escala.authservice.dto.GenerateScheduleRequest;
import com.escala.authservice.entity.*;
import com.escala.authservice.repository.*;
import com.escala.authservice.scheduling.domain.enums.StatusTroca;
import com.escala.authservice.scheduling.domain.model.FluxoTrocaEscala;
import com.escala.authservice.scheduling.domain.model.SolicitacaoTrocaEscala;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final EmployeeRepository employeeRepository;
    private final WorkShiftRepository workShiftRepository;
    private final ShiftSwapRequestRepository shiftSwapRequestRepository;
    private final AbsenceRepository absenceRepository;
    private final ProjectRepository projectRepository;
    private final AuditLogService auditLogService;

    public List<WorkShift> listMonth(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        return workShiftRepository.findByShiftDateBetweenOrderByShiftDateAscStartTimeAsc(
                yearMonth.atDay(1),
                yearMonth.atEndOfMonth()
        );
    }

    @Transactional
    public List<WorkShift> generateMonth(GenerateScheduleRequest request) {
        YearMonth yearMonth = YearMonth.of(request.getYear(), request.getMonth());
        List<Employee> employees = resolveEmployees(request);
        if (employees.isEmpty()) {
            throw new IllegalStateException("Nao ha funcionarios ativos para gerar escala");
        }

        Map<Long, Integer> allocationCount = employees.stream()
                .collect(Collectors.toMap(Employee::getId, employee -> 0));
        Long previousEmployeeId = null;
        List<WorkShift> generated = new ArrayList<>();

        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            LocalDate date = yearMonth.atDay(day);
            validateDailyCapacity(request, date);
            Employee selected = selectEmployee(employees, allocationCount, previousEmployeeId);

            if (!workShiftRepository.existsByEmployeeIdAndShiftDate(selected.getId(), date)) {
                WorkShift shift = WorkShift.builder()
                        .employee(selected)
                        .shiftDate(date)
                        .startTime(request.getStartTime())
                        .endTime(request.getEndTime())
                        .status(ShiftStatus.SCHEDULED)
                        .workMode(request.getWorkMode())
                        .notes("Gerada automaticamente")
                        .build();
                generated.add(workShiftRepository.save(shift));
            }

            allocationCount.computeIfPresent(selected.getId(), (id, count) -> count + 1);
            previousEmployeeId = selected.getId();
        }

        auditLogService.record(
                "system",
                "SCHEDULE_MONTH_GENERATED",
                "WorkShift",
                yearMonth,
                "Escalas geradas: " + generated.size() + "; modalidade=" + request.getWorkMode()
        );
        return generated;
    }

    public ShiftSwapRequest requestSwap(CreateShiftSwapRequest request) {
        Employee requester = employeeRepository.findById(request.getRequesterId()).orElseThrow();
        return requestSwap(request, requester);
    }

    public ShiftSwapRequest requestSwap(CreateShiftSwapRequest request, String userEmail) {
        Employee requester = request.getRequesterId() == null
                ? resolveRequester(userEmail)
                : employeeRepository.findById(request.getRequesterId()).orElseThrow();
        return requestSwap(request, requester);
    }

    private ShiftSwapRequest requestSwap(CreateShiftSwapRequest request, Employee requester) {
        WorkShift originalShift = workShiftRepository.findById(request.getOriginalShiftId()).orElseThrow();

        new SolicitacaoTrocaEscala(
                requester.getId(),
                originalShift.getEmployee().getId(),
                originalShift.getShiftDate(),
                request.getCompensationDate()
        ).validarSolicitacao(LocalDate.now());

        ShiftSwapRequest saved = shiftSwapRequestRepository.save(ShiftSwapRequest.builder()
                .requester(requester)
                .originalShift(originalShift)
                .compensationDate(request.getCompensationDate())
                .comments(request.getComments())
                .status(SwapStatus.PENDING)
                .build());
        auditLogService.record(
                requester.getEmail(),
                "SHIFT_SWAP_REQUESTED",
                "ShiftSwapRequest",
                saved.getId(),
                "Escala original=" + originalShift.getId() + "; compensacao=" + request.getCompensationDate()
        );
        return saved;
    }

    private Employee resolveRequester(String userEmail) {
        return employeeRepository.findByUserEmail(userEmail)
                .or(() -> employeeRepository.findByEmail(userEmail))
                .orElseThrow();
    }

    @Transactional
    public ShiftSwapRequest decideSwap(Long id, DecideShiftSwapRequest request) {
        ShiftSwapRequest swap = shiftSwapRequestRepository.findById(id).orElseThrow();
        if (swap.getStatus() != SwapStatus.PENDING && swap.getStatus() != SwapStatus.COLLEAGUE_APPROVED) {
            throw new IllegalStateException("Solicitacao ja decidida");
        }

        FluxoTrocaEscala fluxo = new FluxoTrocaEscala(toDomainStatus(swap.getStatus()));
        StatusTroca statusGestor = fluxo.decidirPeloGestor(request.isApproved());
        swap.setStatus(toPersistenceStatus(statusGestor));
        swap.setAdminComments(request.getAdminComments());
        swap.setDecidedAt(OffsetDateTime.now());

        if (request.isApproved() && swap.getCompensationDate() != null) {
            WorkShift originalShift = swap.getOriginalShift();
            if (!workShiftRepository.existsByEmployeeIdAndShiftDate(
                    swap.getRequester().getId(),
                    swap.getCompensationDate()
            )) {
                workShiftRepository.save(WorkShift.builder()
                        .employee(swap.getRequester())
                        .shiftDate(swap.getCompensationDate())
                        .startTime(originalShift.getStartTime())
                        .endTime(originalShift.getEndTime())
                        .status(ShiftStatus.SCHEDULED)
                        .workMode(originalShift.getWorkMode())
                        .notes("Compensacao da troca #" + swap.getId())
                        .build());
            }
            originalShift.setStatus(ShiftStatus.CANCELLED);
            workShiftRepository.save(originalShift);
            if (request.isEffective()) {
                swap.setStatus(toPersistenceStatus(fluxo.efetivar()));
            }
        }

        ShiftSwapRequest saved = shiftSwapRequestRepository.save(swap);
        auditLogService.record(
                "manager",
                request.isApproved() ? "SHIFT_SWAP_APPROVED" : "SHIFT_SWAP_REJECTED",
                "ShiftSwapRequest",
                saved.getId(),
                "Status=" + saved.getStatus() + "; comentarios=" + request.getAdminComments()
        );
        return saved;
    }

    @Transactional
    public ShiftSwapRequest approveByColleague(Long id) {
        ShiftSwapRequest swap = shiftSwapRequestRepository.findById(id).orElseThrow();
        FluxoTrocaEscala fluxo = new FluxoTrocaEscala(toDomainStatus(swap.getStatus()));
        swap.setStatus(toPersistenceStatus(fluxo.aprovarPeloColega()));
        ShiftSwapRequest saved = shiftSwapRequestRepository.save(swap);
        auditLogService.record(
                "colleague",
                "SHIFT_SWAP_COLLEAGUE_APPROVED",
                "ShiftSwapRequest",
                saved.getId(),
                "Status=" + saved.getStatus()
        );
        return saved;
    }

    public List<ShiftSwapRequest> swapRequests() {
        return shiftSwapRequestRepository.findAll();
    }

    public DashboardSummaryResponse dashboardSummary(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        return DashboardSummaryResponse.builder()
                .activeEmployees(employeeRepository.countByActiveTrue())
                .activeProjects(projectRepository.countByActiveTrue())
                .shiftsInMonth(workShiftRepository.countByShiftDateBetween(start, end))
                .pendingSwapRequests(shiftSwapRequestRepository.countByStatus(SwapStatus.PENDING))
                .absencesInMonth(absenceRepository.countByAbsenceDateBetween(start, end))
                .build();
    }

    private List<Employee> resolveEmployees(GenerateScheduleRequest request) {
        if (request.getEmployeeIds() == null || request.getEmployeeIds().isEmpty()) {
            return employeeRepository.findByActiveTrueOrderByFullNameAsc();
        }
        return employeeRepository.findAllById(request.getEmployeeIds()).stream()
                .filter(Employee::isActive)
                .sorted(Comparator.comparing(Employee::getFullName))
                .toList();
    }

    private void validateDailyCapacity(GenerateScheduleRequest request, LocalDate date) {
        if (request.getWorkMode() != WorkMode.PRESENCIAL || request.getMaxPresentialPerDay() == null) {
            return;
        }
        long presentialShifts = workShiftRepository.countByShiftDateAndWorkMode(date, WorkMode.PRESENCIAL);
        if (presentialShifts >= request.getMaxPresentialPerDay()) {
            throw new IllegalStateException("Lotacao presencial excedida para " + date);
        }
    }

    private Employee selectEmployee(List<Employee> employees, Map<Long, Integer> allocationCount, Long previousEmployeeId) {
        return employees.stream()
                .filter(employee -> employees.size() == 1 || !Objects.equals(employee.getId(), previousEmployeeId))
                .min(Comparator
                        .comparing((Employee employee) -> allocationCount.getOrDefault(employee.getId(), 0))
                        .thenComparing(Employee::getFullName))
                .orElse(employees.get(0));
    }

    private StatusTroca toDomainStatus(SwapStatus status) {
        return switch (status) {
            case PENDING -> StatusTroca.SOLICITADO;
            case COLLEAGUE_APPROVED -> StatusTroca.APROVADO_PELO_COLEGA;
            case APPROVED -> StatusTroca.APROVADO_PELO_GESTOR;
            case EFFECTIVE -> StatusTroca.EFETIVADO;
            case REJECTED -> StatusTroca.REJEITADO;
            case CANCELLED -> StatusTroca.CANCELADO;
        };
    }

    private SwapStatus toPersistenceStatus(StatusTroca status) {
        return switch (status) {
            case SOLICITADO, EM_ANALISE -> SwapStatus.PENDING;
            case APROVADO_PELO_COLEGA -> SwapStatus.COLLEAGUE_APPROVED;
            case APROVADO_PELO_GESTOR -> SwapStatus.APPROVED;
            case EFETIVADO -> SwapStatus.EFFECTIVE;
            case REJEITADO -> SwapStatus.REJECTED;
            case CANCELADO -> SwapStatus.CANCELLED;
        };
    }
}
