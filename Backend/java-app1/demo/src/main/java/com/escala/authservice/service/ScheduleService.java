package com.escala.authservice.service;

import com.escala.authservice.dto.CreateShiftSwapRequest;
import com.escala.authservice.dto.DashboardSummaryResponse;
import com.escala.authservice.dto.DecideShiftSwapRequest;
import com.escala.authservice.dto.GenerateScheduleRequest;
import com.escala.authservice.dto.escala.EscalaRequest;
import com.escala.authservice.dto.escala.EscalaResponse;
import com.escala.authservice.dto.escala.UsuarioEscalaResponse;
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
    private final SectorRepository sectorRepository;
    private final AuditLogService auditLogService;

    public List<WorkShift> listMonth(int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        return workShiftRepository.findByShiftDateBetweenOrderByShiftDateAscStartTimeAsc(
                yearMonth.atDay(1),
                yearMonth.atEndOfMonth()
        );
    }

    public List<EscalaResponse> listEscalas(LocalDate inicio, LocalDate fim, Long usuarioId, Long setorId, Long projetoId) {
        LocalDate start = inicio == null ? YearMonth.now().atDay(1) : inicio;
        LocalDate end = fim == null ? YearMonth.from(start).atEndOfMonth() : fim;
        return workShiftRepository.findByShiftDateBetweenOrderByShiftDateAscStartTimeAsc(start, end).stream()
                .filter(shift -> usuarioId == null || Objects.equals(shift.getEmployee().getId(), usuarioId))
                .filter(shift -> setorId == null || shift.getEmployee().getSector() != null && Objects.equals(shift.getEmployee().getSector().getId(), setorId))
                .filter(shift -> projetoId == null || shift.getEmployee().getProject() != null && Objects.equals(shift.getEmployee().getProject().getId(), projetoId))
                .map(EscalaResponse::from)
                .toList();
    }

    public List<EscalaResponse> listEscalasDoUsuario(String userEmail, LocalDate inicio, LocalDate fim) {
        Employee employee = resolveRequester(userEmail);
        LocalDate start = inicio == null ? YearMonth.now().atDay(1) : inicio;
        LocalDate end = fim == null ? YearMonth.from(start).atEndOfMonth() : fim;
        return workShiftRepository.findByEmployeeIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(employee.getId(), start, end)
                .stream()
                .map(EscalaResponse::from)
                .toList();
    }

    public List<EscalaResponse> listEscalasDoDia(LocalDate data, String userEmail, boolean admin) {
        if (data == null) {
            throw new IllegalArgumentException("Parametro data e obrigatorio");
        }
        List<WorkShift> shifts = admin
                ? workShiftRepository.findByShiftDateOrderByStartTimeAsc(data)
                : workShiftRepository.findByEmployeeIdAndShiftDateOrderByStartTimeAsc(resolveRequester(userEmail).getId(), data);
        return shifts.stream().map(EscalaResponse::from).toList();
    }

    @Transactional
    public List<EscalaResponse> createEscalas(EscalaRequest request, String userEmail) {
        Employee employee = employeeRepository.findById(request.getEmployeeId()).orElseThrow();
        applyEmployeeAllocation(employee, request);
        validateEmployeeSelection(employee, request);
        if (request.getDates() == null || request.getDates().isEmpty()) {
            throw new IllegalArgumentException("Selecione ao menos uma data");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Horario inicial e final sao obrigatorios");
        }

        List<WorkShift> saved = new ArrayList<>();
        for (LocalDate date : request.getDates()) {
            if (workShiftRepository.existsByEmployeeIdAndShiftDate(employee.getId(), date)) {
                throw new IllegalStateException("Funcionario ja possui escala em " + date);
            }
            WorkMode workMode = request.getWorkMode() == null ? WorkMode.PRESENCIAL : request.getWorkMode();
            validateSectorCapacity(employee, request, date, workMode, null);
            WorkShift shift = WorkShift.builder()
                    .employee(employee)
                    .shiftDate(date)
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .status(ShiftStatus.SCHEDULED)
                    .workMode(workMode)
                    .notes(request.getNotes())
                    .build();
            saved.add(workShiftRepository.save(shift));
        }

        auditLogService.record(
                userEmail,
                "SHIFT_CREATED",
                "WorkShift",
                employee.getId(),
                "Escalas criadas=" + saved.size()
        );
        return saved.stream().map(EscalaResponse::from).toList();
    }

    @Transactional
    public EscalaResponse updateEscala(Long id, EscalaRequest request, String userEmail) {
        WorkShift shift = workShiftRepository.findById(id).orElseThrow();
        if (request.getEmployeeId() != null && !Objects.equals(request.getEmployeeId(), shift.getEmployee().getId())) {
            shift.setEmployee(employeeRepository.findById(request.getEmployeeId()).orElseThrow());
        }
        applyEmployeeAllocation(shift.getEmployee(), request);
        validateEmployeeSelection(shift.getEmployee(), request);
        if (request.getDates() != null && !request.getDates().isEmpty()) {
            LocalDate newDate = request.getDates().get(0);
            if (!Objects.equals(newDate, shift.getShiftDate())
                    && workShiftRepository.existsByEmployeeIdAndShiftDate(shift.getEmployee().getId(), newDate)) {
                throw new IllegalStateException("Funcionario ja possui escala em " + newDate);
            }
            shift.setShiftDate(newDate);
        }
        if (request.getStartTime() != null) shift.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) shift.setEndTime(request.getEndTime());
        if (request.getWorkMode() != null) shift.setWorkMode(request.getWorkMode());
        if (request.getNotes() != null) shift.setNotes(request.getNotes());
        validateSectorCapacity(shift.getEmployee(), request, shift.getShiftDate(), shift.getWorkMode(), shift.getId());

        WorkShift saved = workShiftRepository.save(shift);
        auditLogService.record(userEmail, "SHIFT_UPDATED", "WorkShift", saved.getId(), "Escala atualizada");
        return EscalaResponse.from(saved);
    }

    @Transactional
    public void cancelEscala(Long id, String userEmail) {
        WorkShift shift = workShiftRepository.findById(id).orElseThrow();
        shift.setStatus(ShiftStatus.CANCELLED);
        workShiftRepository.save(shift);
        auditLogService.record(userEmail, "SHIFT_CANCELLED", "WorkShift", id, "Escala cancelada");
    }

    public List<UsuarioEscalaResponse> usuariosEscalaveis(Long projectId, Long sectorId, Long companyId, String query) {
        return employeeRepository.findByActiveTrueOrderByFullNameAsc().stream()
                .filter(employee -> projectId == null || employee.getProject() != null && Objects.equals(employee.getProject().getId(), projectId))
                .filter(employee -> sectorId == null || employee.getSector() != null && Objects.equals(employee.getSector().getId(), sectorId))
                .filter(employee -> companyId == null || employee.getCompany() != null && Objects.equals(employee.getCompany().getId(), companyId))
                .filter(employee -> matchesQuery(employee, query))
                .map(UsuarioEscalaResponse::from)
                .toList();
    }

    public UsuarioEscalaResponse usuarioEscalavel(Long id) {
        return UsuarioEscalaResponse.from(employeeRepository.findById(id).orElseThrow());
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

    private void validateSectorCapacity(Employee employee, EscalaRequest request, LocalDate date, WorkMode workMode, Long ignoredShiftId) {
        if (workMode != WorkMode.PRESENCIAL) {
            return;
        }
        Sector sector = request.getSectorId() == null
                ? employee.getSector()
                : sectorRepository.findById(request.getSectorId()).orElseThrow();
        if (sector == null || sector.getMaxSeats() == null || sector.getMaxSeats() <= 0) {
            return;
        }
        long scheduled = ignoredShiftId == null
                ? workShiftRepository.countByShiftDateAndWorkModeAndEmployeeSectorId(date, WorkMode.PRESENCIAL, sector.getId())
                : workShiftRepository.countByShiftDateAndWorkModeAndEmployeeSectorIdAndIdNot(date, WorkMode.PRESENCIAL, sector.getId(), ignoredShiftId);
        if (scheduled >= sector.getMaxSeats()) {
            throw new IllegalStateException("Lotacao do setor " + sector.getName() + " excedida para " + date);
        }
    }

    private void applyEmployeeAllocation(Employee employee, EscalaRequest request) {
        boolean changed = false;

        if (request.getSectorId() != null
                && (employee.getSector() == null || !Objects.equals(employee.getSector().getId(), request.getSectorId()))) {
            employee.setSector(sectorRepository.findById(request.getSectorId()).orElseThrow());
            changed = true;
        }

        if (request.getProjectId() != null
                && (employee.getProject() == null || !Objects.equals(employee.getProject().getId(), request.getProjectId()))) {
            employee.setProject(projectRepository.findById(request.getProjectId()).orElseThrow());
            changed = true;
        }

        if (changed) {
            employeeRepository.save(employee);
        }
    }

    private void validateEmployeeSelection(Employee employee, EscalaRequest request) {
        if (request.getCompanyId() != null
                && (employee.getCompany() == null || !Objects.equals(employee.getCompany().getId(), request.getCompanyId()))) {
            throw new IllegalStateException("Funcionario nao pertence a empresa selecionada");
        }
        if (request.getSectorId() != null
                && (employee.getSector() == null || !Objects.equals(employee.getSector().getId(), request.getSectorId()))) {
            throw new IllegalStateException("Funcionario nao pertence ao setor selecionado");
        }
        if (request.getProjectId() != null
                && (employee.getProject() == null || !Objects.equals(employee.getProject().getId(), request.getProjectId()))) {
            throw new IllegalStateException("Funcionario nao pertence ao projeto selecionado");
        }
    }

    private boolean matchesQuery(Employee employee, String query) {
        if (query == null || query.isBlank()) {
            return true;
        }
        String normalized = query.trim().toLowerCase(Locale.ROOT);
        return employee.getFullName().toLowerCase(Locale.ROOT).contains(normalized)
                || employee.getEmail().toLowerCase(Locale.ROOT).contains(normalized);
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
